import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Select, message, Tag, Typography } from 'antd';
import { CarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);

    const token = localStorage.getItem('token');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                message.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/drivers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDrivers(data);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchDrivers();
    }, []);

    // Group orders by customerId
    const groupedOrders = useMemo(() => {
        const groups = {};
        orders.forEach(order => {
            const cid = order.customerId;
            if (!groups[cid]) {
                groups[cid] = {
                    customerId: cid,
                    customerName: order.customer?.name || order.customer?.email || `Müşteri #${cid}`,
                    orders: [],
                    totalPrice: 0,
                    date: order.orderDate,
                };
            }
            groups[cid].orders.push(order);
            groups[cid].totalPrice += order.totalPrice;
        });
        return Object.values(groups);
    }, [orders]);

    const handleAssignClick = (group) => {
        setSelectedGroup(group);
        setAssignModalVisible(true);
        setSelectedDriver(null);
    };

    const handleAssignSubmit = async () => {
        if (!selectedDriver) {
            message.warning('Lütfen bir şoför seçin!');
            return;
        }

        const orderIds = selectedGroup.orders.map(o => o.id);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/assign-driver-bulk?driverId=${selectedDriver}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderIds)
            });

            if (response.ok) {
                message.success(`${orderIds.length} sipariş şoföre atandı!`);
                setAssignModalVisible(false);
                fetchOrders();
            } else {
                message.error('Şoför atama başarısız');
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
            message.error('Bir hata oluştu');
        }
    };

    const getGroupStatus = (groupOrders) => {
        const statuses = [...new Set(groupOrders.map(o => o.status))];
        if (statuses.length === 1) return statuses[0];
        return 'Mixed';
    };

    const statusColorMap = {
        Pending: 'orange',
        Shipped: 'blue',
        Delivered: 'green',
        PartialDelivered: 'purple',
        Mixed: 'default',
    };

    const columns = [
        {
            title: 'Müşteri',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 140,
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#f9b17a' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8a8fb0' }}>ID: {record.customerId}</div>
                </div>
            ),
        },
        {
            title: 'Ürünler',
            key: 'products',
            width: 380,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {record.orders.map(order => (
                        <div key={order.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 8,
                            padding: '6px 12px',
                            borderLeft: '3px solid #f9b17a',
                        }}>
                            <span style={{ flex: 1, fontWeight: 500 }}>{order.product?.name || `Ürün #${order.productId}`}</span>
                            <span style={{ color: '#aab8d0', margin: '0 12px', whiteSpace: 'nowrap' }}>x{order.quantity}</span>
                            <span style={{ color: '#f9b17a', fontWeight: 600, whiteSpace: 'nowrap' }}>${order.totalPrice}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Toplam',
            key: 'totalPrice',
            width: 100,
            render: (_, record) => (
                <span style={{ fontWeight: 700, color: '#f9b17a', fontSize: '1.05rem' }}>
                    ${record.totalPrice}
                </span>
            ),
        },
        {
            title: 'Tarih',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (date) => new Date(date).toLocaleDateString('tr-TR'),
        },
        {
            title: 'Durum',
            key: 'status',
            width: 110,
            render: (_, record) => {
                const status = getGroupStatus(record.orders);
                return (
                    <Tag color={statusColorMap[status] || 'default'}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'İşlem',
            key: 'action',
            width: 150,
            render: (_, record) => {
                const allPending = record.orders.every(o => o.status === 'Pending');
                return allPending ? (
                    <Button
                        type="primary"
                        icon={<CarOutlined />}
                        onClick={() => handleAssignClick(record)}
                    >
                        Şoför Ata
                    </Button>
                ) : null;
            },
        },
    ];

    return (
        <div>
            <Title level={2}>Sipariş Yönetimi (Tüm Siparişler)</Title>
            <Table
                columns={columns}
                dataSource={groupedOrders}
                rowKey="customerId"
                loading={loading}
            />

            <Modal
                title="Şoför Ata"
                open={assignModalVisible}
                onOk={handleAssignSubmit}
                onCancel={() => setAssignModalVisible(false)}
            >
                <p>
                    <strong>{selectedGroup?.customerName}</strong> müşterisinin{' '}
                    <strong>{selectedGroup?.orders?.length}</strong> siparişi şoföre atanacak:
                </p>
                <div style={{ marginBottom: 16 }}>
                    {selectedGroup?.orders?.map(order => (
                        <div key={order.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 6,
                            marginBottom: 4,
                        }}>
                            <span>{order.product?.name}</span>
                            <span style={{ color: '#f9b17a' }}>x{order.quantity} — ${order.totalPrice}</span>
                        </div>
                    ))}
                </div>

                <Select
                    style={{ width: '100%' }}
                    placeholder="Şoför seçin"
                    onChange={(value) => setSelectedDriver(value)}
                    value={selectedDriver}
                >
                    {drivers.map(driver => (
                        <Option key={driver.id} value={driver.id}>
                            {driver.name || driver.email} (ID: {driver.id})
                        </Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default OrderManagement;
