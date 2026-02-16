import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { LockOutlined, CreditCardOutlined, ShoppingOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            await axiosInstance.post('/Orders/checkout');
            // Clear local cart state
            setLoading(false);
            navigate('/order-confirmation');
        } catch (error) {
            console.error('Checkout failed:', error);
            setLoading(false);
            alert('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

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
                    disabled={!isFormValid || loading}
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
