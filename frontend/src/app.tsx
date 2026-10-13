import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Registration from './components/registration'
import Autorization from './components/autorization'
import RequestsView from './components/requests_view'
import RequestsForm from './components/requests_form'
import AdminPanel from './components/admin_panel'
import logo from './assets/logo.jpg'
import './app.scss'

export default function App() {
  useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('admin') === '1'
  const home = !token ? '/login' : isAdmin ? '/admin' : '/requests'

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <>
      <header className="header">
        <Link to={home} className="logo">
          <img src={logo} alt="Логотип" />
          Конференции.РФ
        </Link>
        {token && (
          <nav className="nav">
            {isAdmin ? (
              <Link to="/admin">Все заявки</Link>
            ) : (
              <>
                <Link to="/requests">Мои заявки</Link>
                <Link to="/new">Новая заявка</Link>
              </>
            )}
            <button className="link" onClick={logout}>Выйти</button>
          </nav>
        )}
      </header>

      <main className="main">
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Autorization />} />
          <Route path="/requests" element={token ? <RequestsView /> : <Navigate to="/login" />} />
          <Route path="/new" element={token ? <RequestsForm /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={home} />} />
        </Routes>
      </main>

      <footer className="footer">© 2027 Конференции.РФ — бронирование помещений для конференций</footer>
    </>
  )
}
