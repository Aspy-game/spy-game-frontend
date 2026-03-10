import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/register.css'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register(formData)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [key]: e.target.value })

  return (
      <div
        className="page page-register"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        <h1 className="register-title">ĐĂNG KÝ</h1>

        <div className="register-panel">
          <button className="close" aria-label="Đóng" onClick={() => navigate('/')}>
            <span aria-hidden="true">×</span>
          </button>

          <form onSubmit={handleSubmit}>
            <div className="register-field" style={{ top: 80 }}>
              <input
                type="text"
                className="register-input"
                placeholder="Tên hiển thị"
                value={formData.display_name}
                onChange={set('display_name')}
                required
              />
            </div>

            <div className="register-field" style={{ top: 192 }}>
              <input
                type="text"
                className="register-input"
                placeholder="Tên tài khoản"
                value={formData.username}
                onChange={set('username')}
                required
              />
            </div>

            <div className="register-field" style={{ top: 304 }}>
              <input
                type="email"
                className="register-input"
                placeholder="Email"
                value={formData.email}
                onChange={set('email')}
                required
              />
            </div>

            <div className="register-field" style={{ top: 416 }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="register-input"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={set('password')}
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

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>
        </div>

        <p className="register-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
  )
}
