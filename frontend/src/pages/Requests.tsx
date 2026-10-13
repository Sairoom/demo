import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Req } from '../api'
import RequestCard from '../components/RequestCard'

function ReviewForm({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSend(text) }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Отзыв о мероприятии" />
      <button className="btn">Оставить отзыв</button>
    </form>
  )
}

export default function Requests() {
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
