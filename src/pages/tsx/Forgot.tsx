import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/forgot.css'

export default function Forgot() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const { forgotPassword, verifyResetToken, loading, error: authError } = useAuth()
  const [localError, setLocalError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleGetOtp = async () => {
    setLocalError(null)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setLocalError('Tên tài khoản không hợp lệ.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Định dạng email không hợp lệ.');
      return;
    }
    const result = await forgotPassword(username, email)
    if (result.success) {
      alert(result.message)
    } else {
      setLocalError(result.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!username || !email || !otp) {
      setLocalError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    const result = await verifyResetToken(username, email, otp)
    if (result.success) {
      navigate('/reset', { state: { username, email, otp } })
    } else {
      setLocalError(result.message)
    }
  }

  const error = localError || authError;

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
            onClick={handleGetOtp}
            aria-label="Nhận mã xác nhận"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Nhận mã xác nhận'}
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
