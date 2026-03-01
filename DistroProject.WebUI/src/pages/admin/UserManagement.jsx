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
                message.error('Failed to load users.');
            }
        } catch {
            message.error('An error occurred.');
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
                message.success(`${activeTab === 'drivers' ? 'Driver' : 'Admin'} added successfully!`);
                setIsModalVisible(false);
                form.resetFields();
                fetchUsers();
            } else {
                const errorData = await response.text();
                message.error(`Error: ${errorData}`);
            }
        } catch {
            message.error('Failed to add user.');
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
                message.success('User deleted successfully.');
                fetchUsers();
            } else {
                const errorData = await response.text();
                message.error(`Delete failed: ${errorData}`);
            }
        } catch {
            message.error('Failed to delete user.');
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
                message.success(`${user.name} premium status updated!`);
                fetchUsers();
            } else {
                const err = await res.text();
                message.error(`Error: ${err}`);
            }
        } catch {
            message.error('An error occurred.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    const tabs = [
        { key: 'drivers', label: <span><CarOutlined style={{ marginRight: 4 }} />Drivers</span> },
        { key: 'admins', label: <span><SafetyCertificateOutlined style={{ marginRight: 4 }} />Admins</span> },
        { key: 'customers', label: <span><TeamOutlined style={{ marginRight: 4 }} />Customers</span> },
    ];

    const roleLabel = (role) => role === 'Admin' ? 'Admin' : 'Driver';

    return (
        <div>
            <Card
                title="User Management"
                extra={
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Input
                            placeholder="Search name or email..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        {activeTab !== 'customers' && (
                            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                                {activeTab === 'drivers' ? 'Add Driver' : 'Add Admin'}
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
                    <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>No users found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredUsers.map(user => (
                            <div key={user.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderRadius: 10, background: '#fafafa',
                                border: '1px solid #e8e8e8', flexWrap: 'wrap', gap: 8
                            }}>
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                                    {activeTab === 'customers' && (
                                        <div style={{ marginTop: 2 }}>
                                            <Tag color={user.balance < 0 ? 'red' : 'green'}>
                                                Balance: {user.balance < 0 ? `-$${Math.abs(user.balance).toFixed(2)}` : `$${user.balance?.toFixed(2)}`}
                                            </Tag>
                                            {user.isPremium
                                                ? <Tag color="gold" icon={<StarFilled />}>Premium</Tag>
                                                : <Tag color="default" icon={<StarOutlined />}>Standard</Tag>
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
                                            {user.isPremium ? 'Remove Premium' : 'Make Premium'}
                                        </Button>
                                    )}
                                    <Popconfirm
                                        title="Delete User"
                                        description={`Are you sure you want to delete this ${activeTab === 'admins' ? 'admin' : activeTab === 'drivers' ? 'driver' : 'customer'}?`}
                                        onConfirm={() => handleDeleteUser(user.id)}
                                        okText="Yes, Delete"
                                        cancelText="Cancel"
                                    >
                                        <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                title={activeTab === 'drivers' ? 'Add New Driver' : 'Add New Admin'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddUser}>
                    <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter a username!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter an email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter a password!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {activeTab === 'drivers' ? 'Add Driver' : 'Add Admin'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
