import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Flex, Button, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, SearchOutlined, DashboardOutlined, CarOutlined, LogoutOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import logo from '../assets/with-back.png';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../api/productService';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const { cartItemCount } = useCart();

    // Search state
    const [searchText, setSearchText] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // Fetch all products on mount for search
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await getProducts();
                setAllProducts(data);
            } catch (e) {
                console.error('Failed to load products for search', e);
            }
        };
        fetchAll();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Filter products when searchText changes
    useEffect(() => {
        if (searchText.length >= 2) {
            const query = searchText.toLowerCase();
            const filtered = allProducts
                .filter(p => p.name.toLowerCase().includes(query))
                .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                .slice(0, 8);
            setSearchResults(filtered);
            setShowDropdown(true);
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    }, [searchText, allProducts]);

    const getImageUrl = (img, contentType) => {
        if (!img) return 'https://via.placeholder.com/40?text=?';
        if (img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    const handleSelectProduct = (product) => {
        setSearchText('');
        setShowDropdown(false);
        navigate(`/products/${product.id}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AntHeader style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px',
        }}>
            {/* Left: Logo and Brand */}
            <Flex align="center" gap="small" style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate('/')}>
                <img src={logo} alt="Albatros Logo" style={{ height: '40px', width: '40px', borderRadius: '50%' }} />
                <Title level={3} style={{ margin: 0, color: '#fff', lineHeight: '1' }}>
                    ALBATROS
                </Title>
            </Flex>

            {/* Center: Navigation */}
            <Flex align="center" gap="small" style={{ flex: 1, justifyContent: 'center' }}>
                <Button type="link" onClick={() => navigate('/')} style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Home</Button>
                <Button type="link" onClick={() => navigate('/products')} style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Products</Button>
                <Button type="link" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>About Us</Button>

                {/* Role Based Links */}
                {isAuthenticated && user?.role === 'Admin' && (
                    <Button
                        type="link"
                        icon={<DashboardOutlined />}
                        onClick={() => navigate('/admin/orders')}
                        style={{ color: '#f9b17a', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontWeight: 'bold' }}
                    >
                        Admin Panel
                    </Button>
                )}

                {isAuthenticated && user?.role === 'Driver' && (
                    <Button
                        type="link"
                        icon={<CarOutlined />}
                        onClick={() => navigate('/driver')}
                        style={{ color: '#f9b17a', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontWeight: 'bold' }}
                    >
                        Driver Panel
                    </Button>
                )}

                {isAuthenticated && user?.role === 'Customer' && (
                    <Button
                        type="link"
                        icon={<UserOutlined />}
                        onClick={() => navigate('/account')}
                        style={{ color: '#f9b17a', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontWeight: 'bold' }}
                    >
                        Hesabım
                    </Button>
                )}

                {isAuthenticated ? (
                    <Button
                        type="link"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        Log Out
                    </Button>
                ) : (
                    <Button
                        type="link"
                        icon={<LoginOutlined />}
                        onClick={() => navigate('/login')}
                        style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        Login / Register
                    </Button>
                )}
            </Flex>

            {/* Right: Cart and Search */}
            <Flex align="center" gap={16} style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Badge count={cartItemCount} size="small" offset={[-2, 2]} style={{ backgroundColor: '#ff4d4f', boxShadow: '0 0 0 2px #2d2250' }}>
                    <Button type="text" onClick={() => navigate('/cart')} icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />} />
                </Badge>

                {/* Search Autocomplete */}
                <div ref={searchRef} style={{ position: 'relative' }}>
                    <div className="search-input-wrapper">
                        <SearchOutlined className="search-icon" />
                        <input
                            type="text"
                            placeholder="Ürün ara..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onFocus={() => searchText.length >= 2 && setShowDropdown(true)}
                            className="header-search-input"
                        />
                    </div>

                    {showDropdown && (
                        <div className="search-dropdown">
                            {searchResults.length > 0 ? (
                                searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        className="search-dropdown-item"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <img
                                            src={getImageUrl(product.image, product.imageContentType)}
                                            alt={product.name}
                                            className="search-item-image"
                                        />
                                        <div className="search-item-info">
                                            <span className="search-item-name">{product.name}</span>
                                            <span className="search-item-price">${product.price}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="search-no-result">Sonuç bulunamadı</div>
                            )}
                        </div>
                    )}
                </div>
            </Flex>
        </AntHeader>
    );
};

export default Header;
