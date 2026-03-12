import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/forgot.css'

export default function Forgot() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const { loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !otp) return
    navigate('/reset')
  }

  return (
    <div
      className="page page-forgot"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
      }}
    >
      <h1 className="forgot-title">Tạo Mật Khẩu Mới</h1>

      <div className="forgot-panel">
        <button className="close" aria-label="Đóng" onClick={() => navigate('/')}>
          <span aria-hidden="true">×</span>
        </button>

        <form onSubmit={handleSubmit}>
          <div className="forgot-field" style={{ top: 220 }}>
            <input
              type="text"
              className="forgot-input"
              placeholder="Tên tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="forgot-field" style={{ top: 340 }}>
            <input
              type="email"
              className="forgot-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="forgot-field" style={{ top: 460 }}>
            <input
              type="text"
              className="forgot-input"
              placeholder="Mã xác minh (OTP)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="button"
            className="forgot-otp-link"
            onClick={() => {}}
            aria-label="Nhận mã xác nhận"
          >
            Nhận mã xác nhận
          </button>

          {error && <p className="forgot-error">{error}</p>}

          <button type="submit" className="forgot-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </form>
      </div>
    </div>
  )
}
