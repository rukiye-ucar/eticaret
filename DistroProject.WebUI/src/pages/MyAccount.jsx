import React, { useEffect, useState } from 'react';
import { Typography, Spin, Tag, Empty, InputNumber, message, Modal } from 'antd';
import {
    UserOutlined, ShoppingOutlined, ClockCircleOutlined,
    CheckCircleOutlined, CarOutlined, InboxOutlined, DollarOutlined, CrownOutlined,
    CreditCardOutlined, LockOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import './MyAccount.css';

const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const MyAccount = () => {
    const { user, refreshUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

    // Credit Card State
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (img, contentType) => {
        if (!img) return null;
        if (typeof img === 'string' && img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const statusConfig = {
        Pending: { color: 'orange', text: 'Onay Bekliyor', icon: <ClockCircleOutlined /> },
        Approved: { color: 'blue', text: 'Onaylandı', icon: <CheckCircleOutlined /> },
        Shipped: { color: 'cyan', text: 'Kargoya Verildi', icon: <CarOutlined /> },
        Delivered: { color: 'green', text: 'Teslim Edildi', icon: <CheckCircleOutlined /> },
        PartialDelivered: { color: 'purple', text: 'Kısmi Teslimat', icon: <InboxOutlined /> },
    };

    const getStatusTag = (status) => {
        const cfg = statusConfig[status] || { color: 'default', text: status, icon: null };
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.text}</Tag>;
    };

    // Card Handlers
    const handleCardNumber = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = val.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const handleExpiry = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setExpiry(val);
    };

    const handleCvv = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
        setCvv(val);
    };

    const displayCardNumber = () => {
        const raw = cardNumber.replace(/\s/g, '');
        const padded = raw.padEnd(16, '•');
        return padded.replace(/(.{4})/g, '$1 ').trim();
    };

    const isFormValid = cardNumber.replace(/\s/g, '').length === 16
        && cardHolder.trim().length > 1
        && expiry.length === 5
        && cvv.length === 3;

    const openPaymentModal = () => {
        const maxPayable = user.balance < 0 ? Math.abs(user.balance) : 0;
        if (paymentAmount <= 0) {
            message.warning('Lütfen geçerli bir ödeme tutarı girin.');
            return;
        }
        if (paymentAmount > maxPayable) {
            message.warning(`En fazla ${maxPayable.toFixed(2)} TL ödeyebilirsiniz.`);
            return;
        }
        setIsPaymentModalVisible(true);
    };

    const handleConfirmPayment = async () => {
        setPaymentLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/users/make-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: paymentAmount }),
            });
            if (res.ok) {
                message.success(`${paymentAmount} TL ödeme başarıyla gerçekleşti!`);
                setPaymentAmount(0);
                // Kartı temizle
                setCardNumber('');
                setCardHolder('');
                setExpiry('');
                setCvv('');
                setIsPaymentModalVisible(false);
                await refreshUser();
            } else {
                message.error('Ödeme başarısız oldu.');
            }
        } catch (err) {
            message.error('Bir hata oluştu.');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Calculate stats
    const totalOrders = orders.length;
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const shippedCount = orders.filter(o => o.status === 'Shipped').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered' || o.status === 'PartialDelivered').length;
    const totalSpent = orders.reduce((s, o) => s + o.totalPrice, 0);

    // Group orders by date (YYYY-MM-DD)
    const groupedByDate = orders.reduce((acc, order) => {
        const date = new Date(order.orderDate).toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {});

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="my-account-page">
            {/* User Info */}
            <div className="account-header">
                <div className="account-avatar">
                    <UserOutlined />
                </div>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#fff' }}>
                        {user?.name || 'Hesabım'}
                    </Title>
                    <Text style={{ color: '#aab8d0' }}>{user?.email}</Text>
                </div>
            </div>

            {/* Stats */}
            <div className="account-stats">
                <div className="acc-stat-card">
                    <ShoppingOutlined className="acc-stat-icon" />
                    <div>
                        <h3>{totalOrders}</h3>
                        <span>Toplam Sipariş</span>
                    </div>
                </div>
                <div className="acc-stat-card">
                    <ClockCircleOutlined className="acc-stat-icon pending" />
                    <div>
                        <h3>{pendingCount}</h3>
                        <span>Beklemede</span>
                    </div>
                </div>
                <div className="acc-stat-card">
                    <CarOutlined className="acc-stat-icon shipped" />
                    <div>
                        <h3>{shippedCount}</h3>
                        <span>Kargoda</span>
                    </div>
                </div>
                <div className="acc-stat-card">
                    <CheckCircleOutlined className="acc-stat-icon delivered" />
                    <div>
                        <h3>{deliveredCount}</h3>
                        <span>Teslim Edildi</span>
                    </div>
                </div>
            </div>

            {/* Total spent */}
            <div className="total-spent-bar">
                <span>Toplam Harcama</span>
                <span className="total-spent-amount">{totalSpent.toFixed(2)} TL</span>
            </div>

            {/* Premium Balance Section */}
            {user?.isPremium && (
                <div className="premium-balance-section">
                    <div className="premium-balance-header">
                        <CrownOutlined style={{ color: '#f9b17a', fontSize: 20 }} />
                        <span className="premium-badge-label">Premium Müşteri</span>
                    </div>
                    <div className="balance-display">
                        <span className="balance-label">Bakiye</span>
                        <span className={`balance-amount ${user.balance < 0 ? 'negative' : 'positive'}`}>
                            {user.balance < 0 ? `-${Math.abs(user.balance).toFixed(2)} TL` : `${user.balance.toFixed(2)} TL`}
                        </span>
                    </div>
                    {user.balance < 0 && (
                        <p className="balance-debt-text">
                            Toplam borç: <strong>{Math.abs(user.balance).toFixed(2)} TL</strong>
                        </p>
                    )}
                    <div className="payment-form">
                        <InputNumber
                            min={1}
                            max={user.balance < 0 ? Math.abs(user.balance) : 0}
                            value={paymentAmount}
                            onChange={(v) => setPaymentAmount(v || 0)}
                            prefix="₺"
                            style={{ flex: 1 }}
                            placeholder="Ödeme tutarı"
                            type="number"
                            disabled={user.balance >= 0}
                        />
                        <button
                            className="payment-btn"
                            disabled={paymentLoading || paymentAmount <= 0 || user.balance >= 0}
                            onClick={openPaymentModal}
                        >
                            <span style={{ marginRight: 8 }}>₺</span> Ödeme Yap
                        </button>
                    </div>
                </div>
            )}

            {/* Order History */}
            <Title level={3} style={{ color: '#fff', marginTop: 28, marginBottom: 16 }}>
                Sipariş Geçmişi
            </Title>

            {orders.length === 0 ? (
                <Empty description="Henüz siparişiniz bulunmuyor." />
            ) : (
                <div className="order-history">
                    {Object.entries(groupedByDate).map(([date, dateOrders]) => (
                        <div key={date} className="order-date-group">
                            <div className="order-date-label">
                                <ClockCircleOutlined style={{ color: '#f9b17a' }} />
                                <span>{date}</span>
                            </div>
                            <div className="order-date-items">
                                {dateOrders.map(order => (
                                    <div key={order.id} className="order-history-card">
                                        <div className="order-card-left">
                                            {getImageUrl(order.product?.image, order.product?.imageContentType) ? (
                                                <img
                                                    src={getImageUrl(order.product.image, order.product.imageContentType)}
                                                    alt={order.product?.name}
                                                    className="order-card-img"
                                                />
                                            ) : (
                                                <div className="order-card-img placeholder">?</div>
                                            )}
                                            <div className="order-card-info">
                                                <span className="order-card-name">
                                                    {order.product?.name || `Product #${order.productId}`}
                                                </span>
                                                <span className="order-card-qty">
                                                    Adet: {order.quantity}
                                                    {order.deliveredQuantity > 0 && order.deliveredQuantity !== order.quantity && (
                                                        <span className="delivered-qty"> (Teslim: {order.deliveredQuantity})</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="order-card-right">
                                            <span className="order-card-price">{order.totalPrice} TL</span>
                                            {getStatusTag(order.status)}
                                        </div>

                                        {/* Status timeline */}
                                        <div className="order-status-timeline">
                                            {['Pending', 'Shipped', 'Delivered'].map((step, idx) => {
                                                const stepOrder = ['Pending', 'Shipped', 'Delivered'];
                                                const currentIdx = stepOrder.indexOf(order.status === 'PartialDelivered' ? 'Delivered' : order.status);
                                                const isActive = idx <= currentIdx;
                                                const stepLabels = { Pending: 'Beklemede', Shipped: 'Kargoda', Delivered: 'Teslim Edildi' };
                                                return (
                                                    <div key={step} className={`timeline-step ${isActive ? 'active' : ''}`}>
                                                        <div className="timeline-dot" />
                                                        {idx < 2 && <div className="timeline-line" />}
                                                        <span className="timeline-label">{stepLabels[step]}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            <Modal
                title={<span><CreditCardOutlined /> Ödeme Yap</span>}
                open={isPaymentModalVisible}
                onOk={handleConfirmPayment}
                onCancel={() => setIsPaymentModalVisible(false)}
                okText={`Öde (${paymentAmount} TL)`}
                cancelText="İptal"
                confirmLoading={paymentLoading}
                okButtonProps={{ disabled: !isFormValid, className: 'payment-modal-pay-btn' }}
            >
                <div className="payment-modal-form">
                    <div className="payment-modal-card-preview">
                        <div className="payment-modal-chip" />
                        <div className="payment-modal-number">{displayCardNumber()}</div>
                        <div className="payment-modal-bottom">
                            <div className="payment-modal-holder">
                                <span>Kart Sahibi</span>
                                {cardHolder || 'AD SOYAD'}
                            </div>
                            <div className="payment-modal-expiry">
                                <span>Son Kullanma</span>
                                {expiry || 'AA/YY'}
                            </div>
                        </div>
                    </div>

                    <div className="payment-modal-group">
                        <label>Kart Numarası</label>
                        <input
                            className="payment-modal-input"
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={handleCardNumber}
                            maxLength={19}
                        />
                    </div>

                    <div className="payment-modal-group">
                        <label>Kart Sahibi</label>
                        <input
                            className="payment-modal-input"
                            type="text"
                            placeholder="Ad Soyadınız"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                        />
                    </div>

                    <div className="payment-modal-row">
                        <div className="payment-modal-group" style={{ flex: 1 }}>
                            <label>Son Kullanma Tarihi</label>
                            <input
                                className="payment-modal-input"
                                type="text"
                                placeholder="AA/YY"
                                value={expiry}
                                onChange={handleExpiry}
                                maxLength={5}
                            />
                        </div>
                        <div className="payment-modal-group" style={{ flex: 1 }}>
                            <label>CVV</label>
                            <input
                                className="payment-modal-input"
                                type="password"
                                placeholder="•••"
                                value={cvv}
                                onChange={handleCvv}
                                maxLength={3}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#888', marginTop: 10 }}>
                        <LockOutlined /> Güvenli Ödeme Altyapısı
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyAccount;
