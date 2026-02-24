import React from 'react';
import { Button, Typography, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../pages/ProductList.css'; // Ensure styles are imported

const { Text } = Typography;

const ProductCard = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Helper to handle base64 images or URLs
    const getImageUrl = (img, contentType) => {
        if (!img) return 'https://via.placeholder.com/300?text=No+Image'; // Fallback
        if (img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            message.warning('Please log in first!');
            navigate('/login');
            return;
        }
        addToCart(product);
        message.success(`${product.name} added to cart!`);
    };

    return (
        <div className="product-card">
            <div className="product-image-container" onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
                <img
                    src={getImageUrl(product.image, product.imageContentType)}
                    alt={product.name}
                    className="product-image"
                />
            </div>
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
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;
