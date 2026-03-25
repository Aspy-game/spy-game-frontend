import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { RegisterRequest } from '../../types'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/register.css'

export default function Register() {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    display_name: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const { register, loading, error: authError } = useAuth()
  const [localError, setLocalError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validation logic
    if (formData.display_name.length < 2 || formData.display_name.length > 30) {
      setLocalError('Tên hiển thị phải từ 2 đến 30 ký tự.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      setLocalError('Tên tài khoản phải từ 3-20 ký tự, chỉ chứa chữ, số và gạch dưới.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Định dạng email không hợp lệ.');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setLocalError('Mật khẩu xác nhận không khớp')
      return
    }

    const result = await register(formData);
    if (result) {
      navigate('/lobby');
    }
  }

  const error = localError || authError

  const set = (key: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
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

            <div className="register-field" style={{ top: 528 }}>
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                className="register-input"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirm_password}
                onChange={set('confirm_password')}
                required
              />
              <button
                type="button"
                className="eye-btn"
                aria-label={showConfirmPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              >
                <i className={showConfirmPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
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
