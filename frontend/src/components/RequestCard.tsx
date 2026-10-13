import type { ReactNode } from 'react'
import { formatDate, STATUS_CLASS, type Req } from '../api'

export default function RequestCard({ req, children }: { req: Req; children?: ReactNode }) {
  return (
    <article className="req">
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
