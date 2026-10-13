import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, PAYMENTS, ROOMS } from '../api'
import './requests_form.scss'

export default function RequestsForm() {
  const navigate = useNavigate()
  const [room, setRoom] = useState('')
  const [startDate, setStartDate] = useState('')
  const [payment, setPayment] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!room || !startDate || !payment) return setMessage('Заполните все поля')
    try {
      await api('/requests', 'POST', { room, start_date: startDate, payment })
      navigate('/requests')
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  return (
    <section className="card requests-form">
      <h1>Новая заявка</h1>
      <form onSubmit={submit} noValidate>
        <label className="field">
          Помещение
          <select name="room" value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="">Выберите помещение</option>
            {ROOMS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="field">
          Дата начала конференции
          <input type="date" name="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <fieldset className="requests-form__payment">
          Способ оплаты
          {PAYMENTS.map((p) => (
            <label key={p} className="requests-form__radio">
              <input type="radio" name="payment" value={p} checked={payment === p} onChange={() => setPayment(p)} />
              {p}
            </label>
          ))}
        </fieldset>
        {message && <p className="error">{message}</p>}
        <button className="btn">Отправить</button>
      </form>
    </section>
  )
}
