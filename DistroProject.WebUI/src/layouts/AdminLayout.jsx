import { Layout, Menu, Button, Drawer } from 'antd';
import { UploadOutlined, LogoutOutlined, UnorderedListOutlined, MenuOutlined, DashboardOutlined, CarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SiteHeader from '../components/Header';

const { Content } = Layout;

const AdminLayout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setDrawerOpen(false);
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/admin/orders',
            icon: <UnorderedListOutlined />,
            label: 'Order Management',
            onClick: () => { navigate('/admin/orders'); setDrawerOpen(false); },
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'User Management',
            onClick: () => { navigate('/admin/users'); setDrawerOpen(false); },
        },
        {
            key: '/admin/products',
            icon: <UploadOutlined />,
            label: 'Product Management',
            onClick: () => { navigate('/admin/products'); setDrawerOpen(false); },
        },
        {
            key: '/admin/drivers',
            icon: <CarOutlined />,
            label: 'Driver Management',
            onClick: () => { navigate('/admin/drivers'); setDrawerOpen(false); },
        },
        {
            key: '/admin/invoices',
            icon: <FileTextOutlined />,
            label: 'Invoices',
            onClick: () => { navigate('/admin/invoices'); setDrawerOpen(false); },
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
                <Layout.Sider collapsible style={{ background: '#1a1040' }}>
                    <div style={{
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: 8
                    }}>
                        <DashboardOutlined style={{ color: '#f9b17a', fontSize: 18, marginRight: 8 }} />
                        <span style={{ color: '#f9b17a', fontWeight: 700, fontSize: '0.95rem' }}>Admin Panel</span>
                    </div>
                    <Menu
                        theme="dark"
                        selectedKeys={[location.pathname]}
                        mode="inline"
                        style={{ background: '#1a1040' }}
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
                            <DashboardOutlined style={{ marginRight: 8 }} />
                            Admin Panel
                        </span>
                    }
                    placement="left"
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    width={260}
                    styles={{
                        header: { background: '#1a1040', borderBottom: '1px solid rgba(249,177,122,0.15)' },
                        body: { background: '#1a1040', padding: 0 },
                    }}
                    closeIcon={<span style={{ color: '#fff' }}>✕</span>}
                >
                    <Menu
                        theme="dark"
                        selectedKeys={[location.pathname]}
                        mode="inline"
                        style={{ background: '#1a1040', border: 'none' }}
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

export default AdminLayout;
