export type Req = {
  id: number
  room: string
  start_date: string
  payment: string
  status: string
  review: string | null
  fio?: string
  phone?: string
  email?: string
}

export const ROOMS = ['Аудитория', 'Коворкинг', 'Кинозал']
export const PAYMENTS = ['При очном посещении', 'Перевод по СБП']
export const STATUSES = ['Новая', 'Мероприятие назначено', 'Завершено']
export const STATUS_CLASS: Record<string, string> = { 'Новая': 'new', 'Мероприятие назначено': 'set', 'Завершено': 'done' }

export const formatDate = (d: string) => d.split('-').reverse().join('.')

export async function api<T = any>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch('/api' + url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: localStorage.getItem('token') ?? '' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Проверьте введённые данные')
  return data
}
