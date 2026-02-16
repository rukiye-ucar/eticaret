import React from 'react';
import { Button, Typography } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const { Title } = Typography;

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    const getImageUrl = (img, contentType) => {
        if (!img) return 'https://via.placeholder.com/300?text=No+Image';
        if (img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    if (cartItems.length === 0) {
        return (
            <div className="cart-page-container">
                <div className="cart-empty">
                    <ShoppingCartOutlined className="cart-empty-icon" />
                    <div className="cart-empty-text">Your cart is empty</div>
                    <Button
                        type="primary"
                        onClick={() => navigate('/products')}
                        style={{
                            borderRadius: '25px',
                            fontWeight: 600,
                            height: '42px',
                            padding: '0 32px',
                            background: '#f9b17a',
                            borderColor: '#f9b17a',
                            color: '#2d2250'
                        }}
                    >
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="cart-page-title">🛒 My Cart ({cartItems.length} items)</div>

            {cartItems.map(({ product, quantity }) => (
                <div className="cart-item" key={product.id}>
                    <img
                        src={getImageUrl(product.image, product.imageContentType)}
                        alt={product.name}
                        className="cart-item-image"
                    />
                    <div className="cart-item-info">
                        <div className="cart-item-name" title={product.name}>{product.name}</div>
                        <div className="cart-item-price">${product.price}</div>
                    </div>

                    <div className="cart-item-quantity">
                        <Button
                            className="quantity-btn"
                            icon={<MinusOutlined />}
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                        />
                        <span className="quantity-value">{quantity}</span>
                        <Button
                            className="quantity-btn"
                            icon={<PlusOutlined />}
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                        />
                    </div>

                    <div className="cart-item-subtotal">
                        ${(product.price * quantity).toFixed(2)}
                    </div>

                    <Button
                        className="cart-item-delete"
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(product.id)}
                    />
                </div>
            ))}

            <div className="cart-summary">
                <span className="cart-total-label">Total:</span>
                <span className="cart-total-price">${totalPrice.toFixed(2)}</span>
                <button
                    className="cart-checkout-btn"
                    onClick={() => navigate('/checkout')}
                >
                    Siparişi Tamamla →
                </button>
            </div>
        </div>
    );
};

export default CartPage;
