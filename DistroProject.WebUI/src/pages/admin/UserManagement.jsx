import { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, Card, Tabs, Tag, Popconfirm } from 'antd';
import { UserAddOutlined, CarOutlined, SafetyCertificateOutlined, DeleteOutlined, TeamOutlined, StarOutlined, StarFilled } from '@ant-design/icons';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('drivers');
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpointMap = { drivers: '/users/drivers', admins: '/users/admins', customers: '/users/customers' };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpointMap[activeTab]}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUsers(await response.json());
            } else {
                message.error('Kullanıcılar yüklenemedi.');
            }
        } catch {
            message.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [activeTab]);

    const handleAddUser = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'drivers' ? '/users/create-driver' : '/users/create-admin';
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                message.success(`${activeTab === 'drivers' ? 'Şoför' : 'Admin'} başarıyla eklendi!`);
                setIsModalVisible(false);
                form.resetFields();
                fetchUsers();
            } else {
                const errorData = await response.text();
                message.error(`Hata: ${errorData}`);
            }
        } catch {
            message.error('Kullanıcı eklenemedi.');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                message.success('Kullanıcı başarıyla silindi.');
                fetchUsers();
            } else {
                const errorData = await response.text();
                message.error(`Silme işlemi başarısız: ${errorData}`);
            }
        } catch {
            message.error('Kullanıcı silinemedi.');
        }
    };

    const handleTogglePremium = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !user.isPremium;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/set-premium`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: user.email, isPremium: newStatus }),
            });
            if (res.ok) {
                message.success(`${user.name} premium durumu güncellendi!`);
                fetchUsers();
            } else {
                const err = await res.text();
                message.error(`Hata: ${err}`);
            }
        } catch {
            message.error('Bir hata oluştu.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    const tabs = [
        { key: 'drivers', label: <span><CarOutlined style={{ marginRight: 4 }} />Şoförler</span> },
        { key: 'admins', label: <span><SafetyCertificateOutlined style={{ marginRight: 4 }} />Adminler</span> },
        { key: 'customers', label: <span><TeamOutlined style={{ marginRight: 4 }} />Müşteriler</span> },
    ];

    const roleLabel = (role) => role === 'Admin' ? 'Admin' : 'Driver';

    return (
        <div>
            <Card
                title="Kullanıcı Yönetimi"
                extra={
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Input
                            placeholder="İsim veya email ile ara..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        {activeTab !== 'customers' && (
                            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                                {activeTab === 'drivers' ? 'Şoför Ekle' : 'Admin Ekle'}
                            </Button>
                        )}
                    </div>
                }
            >
                <Tabs
                    defaultActiveKey="drivers"
                    items={tabs}
                    onChange={key => { setActiveTab(key); setSearchText(''); }}
                    style={{ marginBottom: 16 }}
                />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>Yükleniyor...</div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>Kullanıcı bulunamadı.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredUsers.map(user => (
                            <div key={user.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderRadius: 10, background: '#fafafa',
                                border: '1px solid #e8e8e8', flexWrap: 'wrap', gap: 8
                            }}>
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <div style={{ fontWeight: 600, color: '#222' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                                    {activeTab === 'customers' && (
                                        <div style={{ marginTop: 2 }}>
                                            <Tag color={user.balance < 0 ? 'red' : 'green'}>
                                                Bakiye: {user.balance < 0 ? `-$${Math.abs(user.balance).toFixed(2)}` : `$${user.balance?.toFixed(2)}`}
                                            </Tag>
                                            {user.isPremium
                                                ? <Tag color="gold" icon={<StarFilled />}>Premium</Tag>
                                                : <Tag color="default" icon={<StarOutlined />}>Standart</Tag>
                                            }
                                        </div>
                                    )}
                                    {activeTab !== 'customers' && (
                                        <Tag color={user.role === 'Admin' ? 'red' : 'blue'} style={{ marginTop: 2 }}>
                                            {roleLabel(user.role)}
                                        </Tag>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {activeTab === 'customers' && (
                                        <Button
                                            type={user.isPremium ? 'default' : 'primary'}
                                            onClick={() => handleTogglePremium(user)}
                                            icon={user.isPremium ? <StarOutlined /> : <StarFilled />}
                                            size="small"
                                            style={!user.isPremium ? { background: 'linear-gradient(135deg,#f9b17a,#e8834a)', borderColor: '#e8834a' } : {}}
                                        >
                                            {user.isPremium ? "Premium'u Kaldır" : 'Premium Yap'}
                                        </Button>
                                    )}
                                    <Popconfirm
                                        title="Kullanıcıyı Sil"
                                        description={`Bu ${activeTab === 'admins' ? 'admini' : activeTab === 'drivers' ? 'şoförü' : 'müşteriyi'} silmek istediğinize emin misiniz?`}
                                        onConfirm={() => handleDeleteUser(user.id)}
                                        okText="Evet, Sil"
                                        cancelText="İptal"
                                    >
                                        <Button danger icon={<DeleteOutlined />} size="small">Sil</Button>
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                title={activeTab === 'drivers' ? 'Yeni Şoför Ekle' : 'Yeni Admin Ekle'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddUser}>
                    <Form.Item name="username" label="Kullanıcı Adı" rules={[{ required: true, message: 'Lütfen bir kullanıcı adı girin!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="E-posta" rules={[{ required: true, message: 'Lütfen bir e-posta girin!' }, { type: 'email', message: 'Lütfen geçerli bir e-posta girin!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Şifre" rules={[{ required: true, message: 'Lütfen bir şifre girin!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {activeTab === 'drivers' ? 'Şoför Ekle' : 'Admin Ekle'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
