import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, Tabs, Tag, Popconfirm, Tooltip } from 'antd';
import { UserAddOutlined, CarOutlined, SafetyCertificateOutlined, DeleteOutlined, TeamOutlined, StarOutlined, StarFilled, DollarOutlined, SearchOutlined } from '@ant-design/icons';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('drivers');
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let endpoint = '';
            if (activeTab === 'drivers') endpoint = '/users/drivers';
            else if (activeTab === 'admins') endpoint = '/users/admins';
            else if (activeTab === 'customers') endpoint = '/users/customers';

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                message.error('Kullanıcılar getirilemedi.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const handleAddUser = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'drivers' ? '/users/create-driver' : '/users/create-admin';

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success(`${activeTab === 'drivers' ? 'Sürücü' : 'Yönetici'} başarıyla eklendi!`);
                setIsModalVisible(false);
                form.resetFields();
                fetchUsers();
            } else {
                const errorData = await response.text();
                message.error(`Hata: ${errorData}`);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            message.error('Kullanıcı eklenirken bir hata oluştu.');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                message.success('Kullanıcı başarıyla silindi.');
                fetchUsers();
            } else {
                const errorData = await response.text();
                message.error(`Silme işlemi başarısız: ${errorData}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Kullanıcı silinirken bir hata oluştu.');
        }
    };

    const handleTogglePremium = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !user.isPremium;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/set-premium`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: user.email, isPremium: newStatus }),
            });
            if (res.ok) {
                message.success(`${user.name} premium durumu güncellendi!`);
                fetchUsers();
            } else {
                const err = await res.text();
                message.error(`Hata: ${err}`);
            }
        } catch (err) {
            message.error('İşlem sırasında bir hata oluştu.');
        }
    };

    const baseColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'İsim',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'E-posta',
            dataIndex: 'email',
            key: 'email',
        },
    ];

    let columns = [...baseColumns];

    if (activeTab === 'customers') {
        columns.push(
            {
                title: 'Bakiye',
                dataIndex: 'balance',
                key: 'balance',
                render: (balance) => (
                    <Tag color={balance < 0 ? 'red' : 'green'}>
                        {balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : `$${balance?.toFixed(2)}`}
                    </Tag>
                )
            },
            {
                title: 'Premium',
                dataIndex: 'isPremium',
                key: 'isPremium',
                render: (isPremium) => (
                    isPremium ?
                        <Tag color="gold" icon={<StarFilled />}>Premium</Tag> :
                        <Tag color="default" icon={<StarOutlined />}>Standart</Tag>
                )
            },
            {
                title: 'İşlemler',
                key: 'actions',
                render: (_, record) => (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            type={record.isPremium ? 'default' : 'primary'}
                            onClick={() => handleTogglePremium(record)}
                            icon={record.isPremium ? <StarOutlined /> : <StarFilled />}
                            style={!record.isPremium ? { background: 'linear-gradient(135deg, #f9b17a, #e8834a)', borderColor: '#e8834a' } : {}}
                        >
                            {record.isPremium ? 'Premium İptal' : 'Premium Yap'}
                        </Button>
                        <Popconfirm
                            title="Kullanıcıyı Sil"
                            description="Bu müşteriyi silmek istediğinize emin misiniz?"
                            onConfirm={() => handleDeleteUser(record.id)}
                            okText="Evet"
                            cancelText="Hayır"
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </div>
                )
            }
        );
    } else {
        columns.push(
            {
                title: 'Rol',
                dataIndex: 'role',
                key: 'role',
                render: (role) => (
                    <Tag color={role === 'Admin' ? 'red' : 'blue'}>
                        {role === 'Admin' ? 'Yönetici' : 'Sürücü'}
                    </Tag>
                )
            },
            {
                title: 'İşlemler',
                key: 'actions',
                render: (_, record) => (
                    <Popconfirm
                        title="Kullanıcıyı Sil"
                        description={`Bu ${record.role === 'Admin' ? 'yöneticiyi' : 'sürücüyü'} silmek istediğinize emin misiniz?`}
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small">
                            Sil
                        </Button>
                    </Popconfirm>
                )
            }
        );
    }

    const items = [
        {
            key: 'drivers',
            label: (
                <span>
                    <CarOutlined />
                    Sürücüler
                </span>
            ),
        },
        {
            key: 'admins',
            label: (
                <span>
                    <SafetyCertificateOutlined />
                    Yöneticiler
                </span>
            ),
        },
        {
            key: 'customers',
            label: (
                <span>
                    <TeamOutlined />
                    Müşteriler
                </span>
            ),
        },
    ];

    const [searchText, setSearchText] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <Card
                title="Kullanıcı Yönetimi"
                extra={
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Input
                            placeholder="İsim veya E-posta ara..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        {activeTab !== 'customers' && (
                            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                                {activeTab === 'drivers' ? 'Sürücü Ekle' : 'Yönetici Ekle'}
                            </Button>
                        )}
                    </div>
                }
            >
                <Tabs
                    defaultActiveKey="drivers"
                    items={items}
                    onChange={(key) => {
                        setActiveTab(key);
                        setSearchText('');
                    }}
                    style={{ marginBottom: 16 }}
                />

                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={activeTab === 'drivers' ? 'Yeni Sürücü Ekle' : 'Yeni Yönetici Ekle'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddUser}
                >
                    <Form.Item
                        name="username"
                        label="Kullanıcı Adı"
                        rules={[{ required: true, message: 'Lütfen kullanıcı adı girin!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="E-posta"
                        rules={[
                            { required: true, message: 'Lütfen e-posta girin!' },
                            { type: 'email', message: 'Geçerli bir e-posta girin!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Şifre"
                        rules={[{ required: true, message: 'Lütfen şifre girin!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {activeTab === 'drivers' ? 'Sürücü Ekle' : 'Yönetici Ekle'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
