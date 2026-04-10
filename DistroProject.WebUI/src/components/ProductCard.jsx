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
            message.warning('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }
        addToCart(product);
        message.success(`${product.name} added to cart!`);
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
                {isOutOfStock && <div className="out-of-stock-badge">OUT OF STOCK</div>}
            </div>

            {/* Product Info */}
            <div className="product-info">
                <div className="product-meta-row">
                    <div className="product-name" title={product.name}>
                        {product.name}
                    </div>
                    <div className="product-price">
                        ${product.price}
                    </div>
                </div>

                <Button
                    icon={<ShoppingCartOutlined />}
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;
