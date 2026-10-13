import hashlib
import secrets
import sqlite3
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Конференции.РФ")

db = sqlite3.connect("app.db", check_same_thread=False)
db.row_factory = sqlite3.Row
db.executescript("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, login TEXT UNIQUE, password TEXT, fio TEXT,
    phone TEXT, email TEXT, is_admin INTEGER DEFAULT 0, token TEXT);
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), room TEXT,
    start_date TEXT, payment TEXT, status TEXT DEFAULT 'Новая', review TEXT);
""")


def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


db.execute("INSERT OR IGNORE INTO users (login, password, fio, is_admin) VALUES ('Conf2027', ?, 'Администратор', 1)",
           (hash_pw("Demo77"),))
db.commit()

Room = Literal["Аудитория", "Коворкинг", "Кинозал"]
Payment = Literal["При очном посещении", "Перевод по СБП"]
Status = Literal["Новая", "Мероприятие назначено", "Завершено"]


class RegisterIn(BaseModel):
    login: str = Field(min_length=6)
    password: str = Field(min_length=8)
    fio: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    email: str = Field(min_length=1)


class LoginIn(BaseModel):
    login: str
    password: str


class RequestIn(BaseModel):
    room: Room
    start_date: str = Field(min_length=1)
    payment: Payment


class ReviewIn(BaseModel):
    review: str = Field(min_length=1)


class StatusIn(BaseModel):
    status: Status


def current_user(authorization: str = Header("")):
    user = db.execute("SELECT * FROM users WHERE token = ?", (authorization,)).fetchone()
    if not authorization or not user:
        raise HTTPException(401, "Требуется авторизация")
    return user


def current_admin(user=Depends(current_user)):
    if not user["is_admin"]:
        raise HTTPException(403, "Нет доступа")
    return user


def own_request(req_id: int, user) -> sqlite3.Row:
    req = db.execute("SELECT * FROM requests WHERE id = ? AND user_id = ?", (req_id, user["id"])).fetchone()
    if not req:
        raise HTTPException(404, "Заявка не найдена")
    return req


@app.post("/api/register")
def register(data: RegisterIn):
    if db.execute("SELECT 1 FROM users WHERE login = ?", (data.login,)).fetchone():
        raise HTTPException(400, "Такой логин уже занят")
    db.execute("INSERT INTO users (login, password, fio, phone, email) VALUES (?, ?, ?, ?, ?)",
               (data.login, hash_pw(data.password), data.fio, data.phone, data.email))
    db.commit()
    return {"ok": True}


@app.post("/api/login")
def login(data: LoginIn):
    user = db.execute("SELECT * FROM users WHERE login = ? AND password = ?",
                      (data.login, hash_pw(data.password))).fetchone()
    if not user:
        raise HTTPException(401, "Неверный логин или пароль")
    token = secrets.token_hex(16)
    db.execute("UPDATE users SET token = ? WHERE id = ?", (token, user["id"]))
    db.commit()
    return {"token": token, "is_admin": bool(user["is_admin"])}


@app.get("/api/requests")
def my_requests(user=Depends(current_user)):
    rows = db.execute("SELECT * FROM requests WHERE user_id = ? ORDER BY id DESC", (user["id"],))
    return [dict(r) for r in rows]


@app.post("/api/requests")
def create_request(data: RequestIn, user=Depends(current_user)):
    db.execute("INSERT INTO requests (user_id, room, start_date, payment) VALUES (?, ?, ?, ?)",
               (user["id"], data.room, data.start_date, data.payment))
    db.commit()
    return {"ok": True}


@app.patch("/api/requests/{req_id}/review")
def add_review(req_id: int, data: ReviewIn, user=Depends(current_user)):
    if own_request(req_id, user)["status"] != "Завершено":
        raise HTTPException(400, "Отзыв можно оставить только после завершения мероприятия")
    db.execute("UPDATE requests SET review = ? WHERE id = ?", (data.review, req_id))
    db.commit()
    return {"ok": True}


@app.delete("/api/requests/{req_id}")
def delete_request(req_id: int, user=Depends(current_user)):
    if own_request(req_id, user)["status"] != "Новая":
        raise HTTPException(400, "Удалить можно только новую заявку")
    db.execute("DELETE FROM requests WHERE id = ?", (req_id,))
    db.commit()
    return {"ok": True}


@app.get("/api/admin/requests")
def all_requests(admin=Depends(current_admin)):
    rows = db.execute("""SELECT r.*, u.fio, u.phone, u.email FROM requests r
                         JOIN users u ON u.id = r.user_id ORDER BY r.id DESC""")
    return [dict(r) for r in rows]


@app.patch("/api/admin/requests/{req_id}")
def set_status(req_id: int, data: StatusIn, admin=Depends(current_admin)):
    db.execute("UPDATE requests SET status = ? WHERE id = ?", (data.status, req_id))
    db.commit()
    return {"ok": True}
