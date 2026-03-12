import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
      <div
        className="page page-login"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        <h1 className="login-title">ĐĂNG NHẬP</h1>

        <div className="login-panel">
          <button className="close" aria-label="Đóng" onClick={() => navigate('/')}>
            <span aria-hidden="true">×</span>
          </button>

          <form onSubmit={handleSubmit}>
            <div className="login-field" style={{ top: 135 }}>
              <input
                type="text"
                className="login-input"
                placeholder="Tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="login-field" style={{ top: 272 }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="login-input"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPwd(!showPwd)}
              >
                <i className={showPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
              </button>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <Link className="forgot-link" to="/forgot">Quên mật khẩu?</Link>

        <p className="login-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
  )
}
