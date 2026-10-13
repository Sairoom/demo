import { useEffect, useState } from 'react'
import { api, STATUSES, type Req } from '../api'
import { RequestCard } from './requests_view'
import './admin_panel.scss'

export default function AdminPanel() {
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
    <section className="admin-panel">
      <div className="toolbar">
        <h1>Панель администратора</h1>
        <select className="admin-panel__filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <p className="muted">Найдено заявок: {shown.length}</p>
      <div className="grid">
        {shown.map((r) => (
          <RequestCard key={r.id} req={r}>
            <select className="admin-panel__status" value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </RequestCard>
        ))}
      </div>
    </section>
  )
}
