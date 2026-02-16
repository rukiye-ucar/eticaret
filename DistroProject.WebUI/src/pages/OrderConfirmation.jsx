import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleFilled, ShoppingOutlined } from '@ant-design/icons';
import './OrderConfirmation.css';

const confettiColors = ['#f9b17a', '#e8834a', '#576f9d', '#fff', '#a78bfa', '#34d399'];

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        // Generate confetti dots
        const dots = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            delay: Math.random() * 1.5,
            size: 6 + Math.random() * 6,
        }));
        setConfetti(dots);
    }, []);

    return (
        <div className="order-confirmation-page">
            <div className="order-confirmation-card">
                {/* Confetti */}
                <div className="confetti-container">
                    {confetti.map(dot => (
                        <div
                            key={dot.id}
                            className="confetti-dot"
                            style={{
                                left: `${dot.left}%`,
                                backgroundColor: dot.color,
                                width: dot.size,
                                height: dot.size,
                                animationDelay: `${dot.delay}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Success Icon */}
                <div className="success-icon-wrapper">
                    <div className="success-circle">
                        <CheckCircleFilled className="checkmark-icon" />
                    </div>
                </div>

                <h1 className="confirmation-title">Siparişiniz Alındı! 🎉</h1>
                <p className="confirmation-subtitle">
                    Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp
                    tarafınıza ulaştırılacaktır.
                </p>

                <div className="confirmation-order-id">
                    ✓ Ödeme başarıyla tamamlandı
                </div>

                <div>
                    <button
                        className="confirmation-btn"
                        onClick={() => navigate('/products')}
                    >
                        <ShoppingOutlined /> Diğer Ürünlere Git
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
