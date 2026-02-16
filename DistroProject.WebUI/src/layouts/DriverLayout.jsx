import { Layout, Menu, theme, Typography } from 'antd';
import { CarOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SiteHeader from '../components/Header';

const { Sider, Content } = Layout;
const { Title } = Typography;

const DriverLayout = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                breakpoint="lg"
                collapsedWidth="80"
                style={{ background: '#1a1445' }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <Title level={4} style={{ margin: 0, color: '#f9b17a', letterSpacing: 1 }}>
                        🚚 Şoför
                    </Title>
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[location.pathname]}
                    mode="inline"
                    style={{ background: '#1a1445', marginTop: 8 }}
                    items={[
                        {
                            key: '/driver',
                            icon: <CarOutlined />,
                            label: 'Teslimatlarım',
                            onClick: () => navigate('/driver'),
                        },
                        {
                            key: 'logout',
                            icon: <LogoutOutlined />,
                            label: 'Çıkış Yap',
                            onClick: handleLogout,
                            danger: true,
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <div style={{ background: '#2d2250' }}>
                    <SiteHeader />
                </div>
                <Content style={{ margin: '0 16px' }}>
                    <div
                        style={{
                            margin: '16px 0',
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DriverLayout;
