import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate, ROOM_PHOTOS, STATUS_CLASS, type Req } from '../api'
import './requests_view.scss'

export function RequestCard({ req, children }: { req: Req; children?: ReactNode }) {
  return (
    <article className="req">
      <img className="req__photo" src={ROOM_PHOTOS[req.room]} alt={req.room} />
      <div className="req__top">
        <h3>{req.room}</h3>
        <span className={`badge badge--${STATUS_CLASS[req.status]}`}>{req.status}</span>
      </div>
      {req.fio && <p className="muted">{req.fio} · {req.phone} · {req.email}</p>}
      <p>Дата начала: <b>{formatDate(req.start_date)}</b></p>
      <p>Оплата: {req.payment}</p>
      {req.review && <blockquote>«{req.review}»</blockquote>}
      {children}
    </article>
  )
}

function ReviewForm({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSend(text) }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Отзыв о мероприятии" />
      <button className="btn">Оставить отзыв</button>
    </form>
  )
}

export default function RequestsView() {
  const [list, setList] = useState<Req[]>([])
  const load = () => api<Req[]>('/requests').then(setList)

  useEffect(() => { load() }, [])

  const sendReview = async (id: number, review: string) => {
    await api(`/requests/${id}/review`, 'PATCH', { review })
    load()
  }

  const remove = async (id: number) => {
    await api(`/requests/${id}`, 'DELETE')
    load()
  }

  return (
    <section>
      <div className="toolbar">
        <h1>Мои заявки</h1>
        <Link to="/new" className="btn">+ Новая заявка</Link>
      </div>
      {!list.length && <p className="muted">У вас пока нет заявок</p>}
      <div className="grid">
        {list.map((r) => (
          <RequestCard key={r.id} req={r}>
            {r.status === 'Завершено' && !r.review && <ReviewForm onSend={(text) => sendReview(r.id, text)} />}
            {r.status === 'Новая' && <button className="btn btn--ghost" onClick={() => remove(r.id)}>Отменить заявку</button>}
          </RequestCard>
        ))}
      </div>
    </section>
  )
}
