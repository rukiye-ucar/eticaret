import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, Typography, message, InputNumber } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const { Title, Text } = Typography;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
            } else {
                message.error('Ürün bulunamadı');
                navigate('/products');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            message.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (img, contentType) => {
        if (!img) return 'https://via.placeholder.com/600?text=No+Image';
        if (img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            message.warning('Lütfen önce giriş yapın!');
            navigate('/login');
            return;
        }
        addToCart(product, quantity);
        message.success(`${product.name} (x${quantity}) sepete eklendi!`);
    };

    if (loading) {
        return (
            <div className="product-detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="product-detail-page">
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                className="back-btn"
                onClick={() => navigate('/products')}
            >
                Ürünlere Dön
            </Button>

            <div className="product-detail-container">
                {/* Left: Image */}
                <div className="product-detail-image-wrapper">
                    <div className="product-detail-image-card">
                        <img
                            src={getImageUrl(product.image, product.imageContentType)}
                            alt={product.name}
                            className="product-detail-image"
                        />
                    </div>
                </div>

                {/* Right: Info */}
                <div className="product-detail-info">
                    <div className="product-detail-categories">
                        {product.categories?.map(cat => (
                            <Tag key={cat.id} color="orange" className="category-tag">
                                {cat.name}
                            </Tag>
                        ))}
                    </div>

                    <Title level={1} className="product-detail-name">
                        {product.name}
                    </Title>

                    <div className="product-detail-price-row">
                        <span className="product-detail-price">${product.price}</span>
                        <span className="product-detail-unit">/ {product.unitType}</span>
                    </div>

                    <div className="product-detail-divider" />

                    <div className="product-detail-meta">
                        <div className="meta-item">
                            <span className="meta-label">Stok</span>
                            <span className={`meta-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.stock > 0 ? `${product.stock} adet mevcut` : 'Stokta yok'}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Birim</span>
                            <span className="meta-value">{product.unitType}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Durum</span>
                            <span className="meta-value">
                                {product.isActive ? (
                                    <Tag color="green">Aktif</Tag>
                                ) : (
                                    <Tag color="red">Pasif</Tag>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="product-detail-divider" />

                    {/* Add to Cart */}
                    <div className="product-detail-cart-section">
                        <div className="quantity-selector">
                            <Text className="quantity-label">Adet:</Text>
                            <InputNumber
                                min={1}
                                max={product.stock}
                                value={quantity}
                                onChange={(val) => setQuantity(val || 1)}
                                size="large"
                                className="quantity-input"
                            />
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingCartOutlined />}
                            className="detail-add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            block
                        >
                            Sepete Ekle — ${(product.price * quantity).toFixed(2)}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
