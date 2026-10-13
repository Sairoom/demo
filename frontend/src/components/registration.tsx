import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import './registration.scss'

const fields = [
  { name: 'login', label: 'Логин', rule: /^[A-Za-z0-9]{6,}$/, error: 'Латиница и цифры, не менее 6 символов' },
  { name: 'password', label: 'Пароль', type: 'password', rule: /^.{8,}$/, error: 'Не менее 8 символов' },
  { name: 'fio', label: 'ФИО', rule: /./, error: 'Обязательное поле' },
  { name: 'phone', label: 'Телефон', placeholder: '8(XXX)XXX-XX-XX', rule: /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/, error: 'Формат: 8(XXX)XXX-XX-XX' },
  { name: 'email', label: 'Email', type: 'email', rule: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, error: 'Неверный формат email' },
]

export default function Registration() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    fields.forEach((f) => {
      const value = form[f.name] ?? ''
      if (!value) errs[f.name] = 'Обязательное поле'
      else if (!f.rule.test(value)) errs[f.name] = f.error
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    try {
      await api('/register', 'POST', form)
      navigate('/login')
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  return (
    <section className="card registration">
      <h1>Регистрация</h1>
      <p className="registration__text">Создайте аккаунт, чтобы бронировать помещения</p>
      <form onSubmit={submit} noValidate>
        {fields.map((f) => (
          <label key={f.name} className="field">
            {f.label}
            <input
              type={f.type ?? 'text'}
              name={f.name}
              placeholder={f.placeholder}
              value={form[f.name] ?? ''}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
            {errors[f.name] && <span className="error">{errors[f.name]}</span>}
          </label>
        ))}
        {message && <p className="error">{message}</p>}
        <button className="btn">Создать пользователя</button>
      </form>
      <Link to="/login">Уже зарегистрированы? Вход</Link>
    </section>
  )
}
