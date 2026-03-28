import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { gameApi } from '../../api/gameApi';
import axiosInstance from '../../api/axiosInstance';
import '../css/shop.css';

interface ShopProps {
  onClose: () => void;
}

interface SkillInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

const SKILLS: SkillInfo[] = [
  {
    id: 'ANONYMOUS_VOTE',
    name: 'Ẩn danh Bỏ phiếu',
    description: 'Ẩn danh tính tất cả người chơi trong vòng bỏ phiếu. Tên đổi thành "Người chơi bí ẩn" và avatar chuyển sang màu xám.',
    price: 200,
    icon: 'fa-solid fa-mask'
  }
];

const Shop: React.FC<ShopProps> = ({ onClose }) => {
  const { user, setUser } = useAuthStore();
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await gameApi.getInventory();
      setInventory(response.data);
      // Cập nhật inventory vào user store nếu cần
      if (user) {
        setUser({ ...user, inventory: response.data });
      }
    } catch (error) {
      console.error('Lỗi khi tải kho đồ:', error);
    }
  };

  const handleBuy = async (skillId: string) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    if ((user?.balance || 0) < skill.price) {
      alert('Bạn không đủ xu để mua kỹ năng này!');
      return;
    }

    if (!window.confirm(`Bạn có muốn mua "${skill.name}" với giá ${skill.price} xu?`)) return;

    try {
      setIsBuying(skillId);
      await gameApi.buySkill(skillId);
      
      // Refresh user profile to get new balance
      const meRes = await axiosInstance.get('/auth/me');
      setUser(meRes.data);
      
      // Refresh inventory
      await fetchInventory();
      
      alert(`Đã mua thành công ${skill.name}!`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi mua kỹ năng.');
    } finally {
      setIsBuying(null);
    }
  };

  return (
    <div className="shop-overlay animate-fade-in">
      <div className="shop-modal animate-pop-in">
        <button className="shop-close-btn" onClick={onClose}>&times;</button>
        
        <div className="shop-header">
          <h2 className="shop-title">CỬA HÀNG KỸ NĂNG</h2>
          <div className="shop-user-balance">
            <i className="fa-solid fa-coins"></i>
            <span>{user?.balance || 0} xu</span>
          </div>
        </div>

        <div className="shop-tabs">
          <button 
            className={`shop-tab ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            Cửa hàng
          </button>
          <button 
            className={`shop-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Kho đồ của tôi
          </button>
        </div>

        <div className="shop-content">
          {activeTab === 'shop' ? (
            <div className="shop-grid">
              {SKILLS.map(skill => (
                <div key={skill.id} className="skill-card">
                  <div className="skill-icon-wrap">
                    <i className={skill.icon}></i>
                  </div>
                  <h3 className="skill-name">{skill.name}</h3>
                  <p className="skill-desc">{skill.description}</p>
                  <div className="skill-footer">
                    <div className="skill-price">
                      <i className="fa-solid fa-coins"></i>
                      <span>{skill.price}</span>
                    </div>
                    <button 
                      className="skill-buy-btn"
                      disabled={isBuying === skill.id}
                      onClick={() => handleBuy(skill.id)}
                    >
                      {isBuying === skill.id ? 'Đang mua...' : 'MUA'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="inventory-list">
              {Object.entries(inventory).length === 0 ? (
                <div className="empty-inventory">
                  <i className="fa-solid fa-box-open"></i>
                  <p>Kho đồ của bạn đang trống.</p>
                </div>
              ) : (
                Object.entries(inventory).map(([id, quantity]) => {
                  const skill = SKILLS.find(s => s.id === id);
                  if (quantity <= 0) return null;
                  return (
                    <div key={id} className="inventory-item">
                      <div className="inv-icon-wrap">
                        <i className={skill?.icon || 'fa-solid fa-cube'}></i>
                      </div>
                      <div className="inv-info">
                        <h4 className="inv-name">{skill?.name || id}</h4>
                        <p className="inv-desc">{skill?.description || ''}</p>
                      </div>
                      <div className="inv-quantity">
                        Số lượng: <span>{quantity}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
