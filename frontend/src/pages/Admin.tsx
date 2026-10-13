import { useEffect, useState } from 'react'
import { api, STATUSES, type Req } from '../api'
import RequestCard from '../components/RequestCard'

export default function Admin() {
  const [list, setList] = useState<Req[]>([])
  const [filter, setFilter] = useState('')
  const load = () => api<Req[]>('/admin/requests').then(setList)

  useEffect(() => { load() }, [])

  const setStatus = async (id: number, status: string) => {
    await api(`/admin/requests/${id}`, 'PATCH', { status })
    load()
  }

  const shown = filter ? list.filter((r) => r.status === filter) : list

  return (
    <section>
      <div className="toolbar">
        <h1>Панель администратора</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {!shown.length && <p className="muted">Заявок нет</p>}
      <div className="grid">
        {shown.map((r) => (
          <RequestCard key={r.id} req={r}>
            <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </RequestCard>
        ))}
      </div>
    </section>
  )
}
