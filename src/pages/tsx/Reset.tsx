import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/reset.css'

export default function Reset() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { resetPassword, loading, error: authError } = useAuth()
  const [localError, setLocalError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Get data from Forgot page
  const { username, email, otp } = location.state || {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Mật khẩu không khớp!')
      return
    }

    if (!username || !email || !otp) {
      setLocalError('Thiếu thông tin xác thực. Vui lòng quay lại trang Quên mật khẩu.')
      return
    }

    const result = await resetPassword(username, email, otp, password)
    if (result.success) {
      alert(result.message || 'Đặt lại mật khẩu thành công!')
      navigate('/login')
    } else {
      setLocalError(result.message)
    }
  }

  const error = localError || authError;

  return (
    <div
      className="page page-reset"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
      }}
    >
      <h1 className="reset-title">Nhập Mật Khẩu Mới</h1>

      <div className="reset-panel">
        <button className="close" aria-label="Đóng" onClick={() => navigate('/')}>
          <span aria-hidden="true">×</span>
        </button>

        <form onSubmit={handleSubmit}>
          <div className="reset-field" style={{ top: 260 }}>
            <input
              type={showPwd ? 'text' : 'password'}
              className="reset-input"
              placeholder="Mật khẩu mới"
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

          <div className="reset-field" style={{ top: 380 }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              className="reset-input"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              <i className={showConfirm ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
            </button>
          </div>

          {error && <p className="reset-error">{error}</p>}

          <button
            type="submit"
            className="reset-button"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </form>
      </div>
    </div>
  )
}
