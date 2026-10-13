import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Requests from './pages/Requests'
import NewRequest from './pages/NewRequest'
import Admin from './pages/Admin'

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
        <Link to={home} className="logo">Конференции.РФ</Link>
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
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/requests" element={token ? <Requests /> : <Navigate to="/login" />} />
          <Route path="/new" element={token ? <NewRequest /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={home} />} />
        </Routes>
      </main>

      <footer className="footer">© 2027 Конференции.РФ — бронирование помещений для конференций</footer>
    </>
  )
}
