import React from 'react';
import { Button, message } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../pages/ProductList.css';

const ProductCard = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const getImageUrl = (img, contentType) => {
        if (!img) return 'https://via.placeholder.com/300?text=No+Image';
        if (img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            message.warning('Sepete eklemek için lütfen giriş yapın.');
            navigate('/login');
            return;
        }
        addToCart(product);
        message.success(`${product.name} sepete eklendi!`);
    };

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    const isOutOfStock = product.stock === 0;

    return (
        <div className="product-card" onClick={handleCardClick}>
            {/* Product Image */}
            <div className={`product-image-container ${isOutOfStock ? 'out-of-stock-img' : ''}`}>
                <img
                    src={getImageUrl(product.image, product.imageContentType)}
                    alt={product.name}
                    className="product-image"
                />
                {isOutOfStock && <div className="out-of-stock-badge">STOKTA YOK</div>}
            </div>

            {/* Product Info */}
            <div className="product-info">
                <div className="product-meta-row">
                    <div className="product-name" title={product.name}>
                        {product.name}
                    </div>
                    <div className="product-price">
                        {product.price} TL
                    </div>
                </div>

                <Button
                    icon={<ShoppingCartOutlined />}
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;
