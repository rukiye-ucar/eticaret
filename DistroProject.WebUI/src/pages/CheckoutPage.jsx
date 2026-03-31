import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LockOutlined, CreditCardOutlined, ShoppingOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';
import AddressMapPicker from '../components/AddressMapPicker';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [payLaterLoading, setPayLaterLoading] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState(null); // { lat, lng, address }
    const [showMap, setShowMap] = useState(false);

    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const getImageUrl = (img, contentType) => {
        if (!img) return 'https://via.placeholder.com/300?text=No+Image';
        if (img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 0
    );

    // Format card number: add spaces every 4 digits
    const handleCardNumber = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = val.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    // Format expiry: MM/YY
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

    const handlePayment = async () => {
        if (!isFormValid) return;
        if (!deliveryInfo) {
            alert('Lütfen önce teslimat adresinizi seçin.');
            setShowMap(true);
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post('/Orders/checkout', {
                deliveryLat: deliveryInfo.lat,
                deliveryLng: deliveryInfo.lng,
                deliveryAddress: deliveryInfo.address,
            });
            await clearCart();
            setLoading(false);
            navigate('/order-confirmation');
        } catch (error) {
            console.error('Checkout failed:', error);
            setLoading(false);
            alert('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handlePayLater = async () => {
        if (!deliveryInfo) {
            alert('Lütfen önce teslimat adresinizi seçin.');
            setShowMap(true);
            return;
        }
        setPayLaterLoading(true);
        try {
            await axiosInstance.post('/Orders/checkout-pay-later', {
                deliveryLat: deliveryInfo.lat,
                deliveryLng: deliveryInfo.lng,
                deliveryAddress: deliveryInfo.address,
            });
            await clearCart();
            await refreshUser();
            setPayLaterLoading(false);
            navigate('/order-confirmation');
        } catch (error) {
            console.error('Pay later failed:', error);
            setPayLaterLoading(false);
            alert('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems.length]);

    return (
        <div className="checkout-page">
            {/* Order Summary */}
            <div className="checkout-summary">
                <div className="checkout-summary-title">
                    <ShoppingOutlined /> Sipariş Özeti
                </div>

                {cartItems.map(({ product, quantity }) => (
                    <div className="checkout-item" key={product.id}>
                        <img
                            src={getImageUrl(product.image, product.imageContentType)}
                            alt={product.name}
                            className="checkout-item-img"
                        />
                        <div className="checkout-item-details">
                            <div className="checkout-item-name">{product.name}</div>
                            <div className="checkout-item-qty">Adet: {quantity}</div>
                        </div>
                        <div className="checkout-item-price">
                            ${(product.price * quantity).toFixed(2)}
                        </div>
                    </div>
                ))}

                <div className="checkout-divider" />

                <div className="checkout-total-row">
                    <span className="checkout-total-label">Toplam</span>
                    <span className="checkout-total-amount">${totalPrice.toFixed(2)}</span>
                </div>

                {/* Delivery Address Section — always shown, required */}
                <div className="checkout-address-section">
                    <div className="checkout-address-header" onClick={() => setShowMap(!showMap)}>
                        <div className="checkout-address-title">
                            <EnvironmentOutlined style={{ color: '#f9b17a', fontSize: '1.1rem' }} />
                            <span>Teslimat Adresi</span>
                            {deliveryInfo
                                ? <span className="address-badge">✓ Seçildi</span>
                                : <span className="address-badge address-badge-required">* Zorunlu</span>
                            }
                        </div>
                        <span className="checkout-address-toggle">{showMap ? '▲' : '▼'} {showMap ? 'Gizle' : 'Haritayı Aç'}</span>
                    </div>

                    {deliveryInfo && !showMap && (
                        <div className="checkout-address-preview">
                            📍 {deliveryInfo.address}
                        </div>
                    )}

                    {showMap && (
                        <div className="checkout-map-wrapper">
                            <AddressMapPicker
                                onAddressSelect={(info) => {
                                    setDeliveryInfo(info);
                                }}
                                initialLat={deliveryInfo?.lat}
                                initialLng={deliveryInfo?.lng}
                                initialAddress={deliveryInfo?.address}
                            />
                        </div>
                    )}


                </div>

                {/* Pay Later for Premium — only after address selected */}
                {user?.isPremium && (
                    <div className="pay-later-section">
                        <div className="pay-later-badge">
                            ⭐ Premium Müşteri
                        </div>
                        <p className="pay-later-desc">
                            Premium müşteri olarak siparişinizi şimdi verin, ödemeyi daha sonra yapın.
                        </p>
                        <button
                            className="pay-later-btn"
                            onClick={handlePayLater}
                            disabled={payLaterLoading || !deliveryInfo}
                            title={!deliveryInfo ? 'Önce teslimat adresi seçin' : ''}
                        >
                            {payLaterLoading ? (
                                <><div className="btn-spinner" /> İşleniyor...</>
                            ) : (
                                <><ClockCircleOutlined /> Daha Sonra Öde — ${totalPrice.toFixed(2)}</>
                            )}
                        </button>
                        {!deliveryInfo && (
                            <p className="pay-later-address-warning">
                                ⚠️ Daha sonra ödeme yapabilmek için önce teslimat adresini seçmelisiniz.
                            </p>
                        )}
                        {user.balance < 0 && (
                            <p className="pay-later-balance-warning">
                                Mevcut borç: <strong>${Math.abs(user.balance).toFixed(2)}</strong>
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Form */}
            <div className="checkout-payment">
                <div className="checkout-payment-title">
                    <CreditCardOutlined /> Ödeme Bilgileri
                </div>
                <div className="checkout-payment-subtitle">
                    Kart bilgilerinizi güvenli bir şekilde girin
                </div>

                {/* Card Preview */}
                <div className="checkout-card-preview">
                    <div className="card-chip" />
                    <div className="card-number-display">{displayCardNumber()}</div>
                    <div className="card-bottom-row">
                        <div className="card-holder-display">
                            <span>Kart Sahibi</span>
                            {cardHolder || 'AD SOYAD'}
                        </div>
                        <div className="card-expiry-display">
                            <span>Son Kullanma</span>
                            {expiry || 'MM/YY'}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="checkout-form-group">
                    <label>Kart Numarası</label>
                    <input
                        className="checkout-input"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumber}
                        maxLength={19}
                    />
                </div>

                <div className="checkout-form-group">
                    <label>Kart Sahibi</label>
                    <input
                        className="checkout-input"
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                    />
                </div>

                <div className="checkout-form-row">
                    <div className="checkout-form-group">
                        <label>Son Kullanma Tarihi</label>
                        <input
                            className="checkout-input"
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={handleExpiry}
                            maxLength={5}
                        />
                    </div>
                    <div className="checkout-form-group">
                        <label>CVV</label>
                        <input
                            className="checkout-input"
                            type="password"
                            placeholder="•••"
                            value={cvv}
                            onChange={handleCvv}
                            maxLength={3}
                        />
                    </div>
                </div>

                <button
                    className="checkout-pay-btn"
                    onClick={handlePayment}
                    disabled={!isFormValid || loading || !deliveryInfo}
                >
                    {loading ? (
                        <><div className="btn-spinner" /> İşleniyor...</>
                    ) : (
                        <><LockOutlined /> Ödeme Yap — ${totalPrice.toFixed(2)}</>
                    )}
                </button>

                <div className="checkout-secure-note">
                    <LockOutlined /> Bilgileriniz güvenli bağlantı ile korunmaktadır
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
