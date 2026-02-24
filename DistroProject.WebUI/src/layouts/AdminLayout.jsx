import { Layout, Menu, theme } from 'antd';
import { UploadOutlined, LogoutOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SiteHeader from '../components/Header';

const { Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu
                    theme="dark"
                    defaultSelectedKeys={[location.pathname]}
                    mode="inline"
                    items={[
                        {
                            key: '/admin/orders',
                            icon: <UnorderedListOutlined />,
                            label: 'Sipariş Yönetimi',
                            onClick: () => navigate('/admin/orders'),
                        },
                        {
                            key: '/admin/users',
                            icon: <UnorderedListOutlined />,
                            label: 'Kullanıcı Yönetimi',
                            onClick: () => navigate('/admin/users'),
                        },
                        {
                            key: '/admin/products',
                            icon: <UploadOutlined />,
                            label: 'Ürün Yönetimi',
                            onClick: () => navigate('/admin/products'),
                        },
                        {
                            key: '/admin/drivers',
                            icon: <UnorderedListOutlined />,
                            label: 'Şoför Yönetimi',
                            onClick: () => navigate('/admin/drivers'),
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

export default AdminLayout;
