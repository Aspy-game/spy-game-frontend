import { useNavigate } from 'react-router-dom'
import bg from '../../../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg'
import '../css/rules.css'

export default function Rules() {
  const navigate = useNavigate()
  return (
    <div
      className="page page-rules"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
      }}
    >
      <div className="rules-panel">
        <h1 className="rules-title">LUẬT CHƠI</h1>

        <div className="rules-content">
          <p>Game “Không phải tôi” là trò chơi mang tính suy luận và tương tác nhóm, trong đó người chơi phải sử dụng khả năng quan sát, tư duy logic và kỹ năng giao tiếp để tìm ra nhân vật gián điệp đang ẩn mình trong nhóm. Trò chơi bắt đầu khi người chơi tham gia vào một phòng chơi và hệ thống tiến hành phân vai ngẫu nhiên cho từng người. Phần lớn người chơi sẽ thuộc vai trò dân thường và được cung cấp cùng một từ khóa hoặc chủ đề bí mật. Ngược lại, người giữ vai trò gián điệp sẽ không nhận được từ khóa này và phải dựa vào các thông tin được chia sẻ trong quá trình chơi để suy đoán nội dung mà những người khác đang biết.</p>
          <p>Sau khi phân vai, trò chơi bước vào vòng thảo luận. Ở mỗi lượt, từng người chơi lần lượt mô tả hoặc đưa ra ý kiến liên quan đến từ khóa bằng những câu nói gián tiếp, tránh nói quá rõ ràng để không tiết lộ trực tiếp nội dung cho gián điệp. Trong quá trình này, gián điệp phải khéo léo đặt câu trả lời sao cho không bị nghi ngờ, đồng thời cố gắng suy luận ra từ khóa dựa trên các phát biểu của dân thường. Người chơi còn lại sẽ quan sát, so sánh và phân tích câu trả lời của nhau nhằm phát hiện ra những biểu hiện bất thường.</p>
          <p>Sau khi kết thúc các lượt thảo luận, trò chơi tiến hành giai đoạn bỏ phiếu. Mỗi người chơi sẽ lựa chọn một người mà mình nghi ngờ là gián điệp. Người nhận được số phiếu cao nhất sẽ bị loại khỏi trò chơi. Nếu người bị loại là gián điệp, dân thường sẽ giành chiến thắng. Ngược lại, nếu dân thường bị loại hoặc gián điệp tồn tại đến cuối trò chơi, gián điệp sẽ chiến thắng. Trò chơi kết thúc khi điều kiện thắng của một trong hai phe được thỏa mãn.</p>
        </div>

        <button className="rules-close" onClick={() => navigate('/')}>×</button>
      </div>
    </div>
  )
}
