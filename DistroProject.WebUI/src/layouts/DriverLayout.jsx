import { Layout, Menu, Button, Drawer, Typography } from 'antd';
import { CarOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SiteHeader from '../components/Header';

const { Content } = Layout;
const { Title } = Typography;

const DriverLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        setDrawerOpen(false);
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/driver',
            icon: <CarOutlined />,
            label: 'My Deliveries',
            onClick: () => { navigate('/driver'); setDrawerOpen(false); },
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Log Out',
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Layout.Sider breakpoint="lg" collapsedWidth={80} style={{ background: '#1a1445' }}>
                    <div style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <Title level={4} style={{ margin: 0, color: '#f9b17a', letterSpacing: 1 }}>
                            🚚 Driver
                        </Title>
                    </div>
                    <Menu
                        theme="dark"
                        selectedKeys={[location.pathname]}
                        mode="inline"
                        style={{ background: '#1a1445', marginTop: 8 }}
                        items={menuItems}
                    />
                </Layout.Sider>
            )}

            <Layout>
                <div style={{ background: '#2d2250', display: 'flex', alignItems: 'center' }}>
                    {/* Mobile Hamburger */}
                    {isMobile && (
                        <Button
                            type="text"
                            icon={<MenuOutlined style={{ color: '#f9b17a', fontSize: 20 }} />}
                            onClick={() => setDrawerOpen(true)}
                            style={{ marginLeft: 12, marginTop: 12 }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <SiteHeader />
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <Drawer
                    title={
                        <span style={{ color: '#f9b17a', fontWeight: 700 }}>
                            🚚 Driver Panel
                        </span>
                    }
                    placement="left"
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    width={240}
                    styles={{
                        header: { background: '#1a1445', borderBottom: '1px solid rgba(249,177,122,0.15)' },
                        body: { background: '#1a1445', padding: 0 },
                    }}
                    closeIcon={<span style={{ color: '#fff' }}>✕</span>}
                >
                    <Menu
                        theme="dark"
                        selectedKeys={[location.pathname]}
                        mode="inline"
                        style={{ background: '#1a1445', border: 'none' }}
                        items={menuItems}
                    />
                </Drawer>

                <Content style={{ margin: '0 8px' }}>
                    <div style={{
                        margin: '12px 0',
                        padding: isMobile ? 12 : 24,
                        minHeight: 360,
                        background: '#fff',
                        borderRadius: 8,
                        overflowX: 'auto',
                    }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DriverLayout;
