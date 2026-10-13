import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!login || !password) return setMessage('Введите логин и пароль')
    try {
      const res = await api('/login', 'POST', { login, password })
      localStorage.setItem('token', res.token)
      localStorage.setItem('admin', res.is_admin ? '1' : '0')
      navigate(res.is_admin ? '/admin' : '/requests')
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  return (
    <section className="card">
      <h1>Вход</h1>
      <form onSubmit={submit} noValidate>
        <label className="field">
          Логин
          <input name="login" value={login} onChange={(e) => setLogin(e.target.value)} />
        </label>
        <label className="field">
          Пароль
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {message && <p className="error">{message}</p>}
        <button className="btn">Войти</button>
      </form>
      <Link to="/register">Еще не зарегистрированы? Регистрация</Link>
    </section>
  )
}
