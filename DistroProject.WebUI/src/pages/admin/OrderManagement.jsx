import { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Select, message, Tag, Typography } from 'antd';
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
                message.error('Siparişler yüklenemedi');
            }
        } catch (error) {
            console.error('Siparişler çekilirken hata:', error);
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

    const groupedOrders = useMemo(() => {
        const groups = {};
        orders.forEach(order => {
            const cid = order.customerId;
            if (!groups[cid]) {
                groups[cid] = {
                    customerId: cid,
                    customerName: order.customer?.name || order.customer?.email || `Customer #${cid}`,
                    orders: [],
                    totalPrice: 0,
                    date: order.orderDate,
                };
            }
            groups[cid].orders.push(order);
            groups[cid].totalPrice += order.totalPrice;
        });
        return Object.values(groups).sort((a, b) => {
            const maxA = Math.max(...a.orders.map(o => o.id));
            const maxB = Math.max(...b.orders.map(o => o.id));
            return maxB - maxA;
        });
    }, [orders]);

    const handleAssignClick = (group) => {
        setSelectedGroup(group);
        setAssignModalVisible(true);
        const existingDriverId = group.orders[0]?.driverId || null;
        setSelectedDriver(existingDriverId);
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
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(orderIds)
            });
            if (response.ok) {
                message.success(`${orderIds.length} sipariş şoföre atandı!`);
                setAssignModalVisible(false);
                fetchOrders();
            } else {
                message.error('Şoför atanamadı');
            }
        } catch (error) {
            message.error('Bir hata oluştu');
        }
    };

    const getGroupStatus = (groupOrders) => {
        const statuses = [...new Set(groupOrders.map(o => o.status))];
        return statuses.length === 1 ? statuses[0] : 'Mixed';
    };

    const statusMap = {
        Pending: 'BEKLEMEDE',
        Shipped: 'KARGODA',
        Delivered: 'TESLİM EDİLDİ',
        PartialDelivered: 'KISMİ TESLİMAT',
        Mixed: 'KARIŞIK'
    };

    const statusColorMap = { Pending: 'orange', Shipped: 'blue', Delivered: 'green', PartialDelivered: 'purple', Mixed: 'default' };

    return (
        <div>
            <Title level={2} style={{ color: '#1a1a2e' }}>Sipariş Yönetimi</Title>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>Yükleniyor...</div>
            ) : groupedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Sipariş bulunamadı.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {groupedOrders.map(group => {
                        const status = getGroupStatus(group.orders);
                        const driver = group.orders[0]?.driver;
                        const hasDriver = !!driver;
                        return (
                            <div key={group.customerId} style={{
                                background: '#f9f9f9',
                                borderRadius: 12,
                                border: '1px solid #e8e8e8',
                                padding: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                {/* Header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#d97b3a', fontSize: '1rem' }}>{group.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Müşteri ID: {group.customerId}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Tag color={statusColorMap[status] || 'default'}>{statusMap[status] || status.toUpperCase()}</Tag>
                                        <span style={{ fontWeight: 700, color: '#d97b3a' }}>{group.totalPrice.toFixed(2)} TL</span>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(group.date).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>

                                {/* Orders */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                    {group.orders.map(order => (
                                        <div key={order.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'rgba(249,177,122,0.08)', borderRadius: 8, padding: '6px 12px',
                                            borderLeft: '3px solid #f9b17a', flexWrap: 'wrap', gap: 4
                                        }}>
                                            <span style={{ fontWeight: 500, flex: 1, minWidth: 100, color: '#333' }}>{order.product?.name || `Ürün #${order.productId}`}</span>
                                            <span style={{ color: '#aaa', marginRight: 8 }}>x{order.quantity}</span>
                                            <span style={{ color: '#d97b3a', fontWeight: 600 }}>{order.totalPrice} TL</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Driver + Action */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    {hasDriver ? (
                                        <Tag color="blue" icon={<CarOutlined />}>{driver.name || driver.email}</Tag>
                                    ) : (
                                        <Tag color="default">Şoför Atanmadı</Tag>
                                    )}
                                    <Button
                                        type={hasDriver ? 'default' : 'primary'}
                                        icon={<CarOutlined />}
                                        onClick={() => handleAssignClick(group)}
                                        style={hasDriver ? { borderColor: '#4a9eff', color: '#4a9eff' } : {}}
                                    >
                                        {hasDriver ? 'Şoförü Değiştir' : 'Şoför Ata'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                title={selectedGroup?.orders?.[0]?.driver ? '🔄 Şoförü Değiştir' : '🚚 Şoför Ata'}
                open={assignModalVisible}
                onOk={handleAssignSubmit}
                onCancel={() => setAssignModalVisible(false)}
                okText="Ata"
                cancelText="İptal"
            >
                {selectedGroup?.orders?.[0]?.driver && (
                    <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: 8, fontSize: '0.85rem', color: '#4a9eff' }}>
                        <CarOutlined style={{ marginRight: 6 }} />
                        Mevcut şoför: <strong>{selectedGroup.orders[0].driver.name || selectedGroup.orders[0].driver.email}</strong>
                    </div>
                )}
                <p>
                    <strong>{selectedGroup?.customerName}</strong> müşterisine ait <strong>{selectedGroup?.orders?.length}</strong> sipariş bir şoföre atanıyor:
                </p>
                <div style={{ marginBottom: 16 }}>
                    {selectedGroup?.orders?.map(order => (
                        <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.03)', borderRadius: 6, marginBottom: 4 }}>
                            <span>{order.product?.name}</span>
                            <span style={{ color: '#d97b3a' }}>x{order.quantity} — {order.totalPrice} TL</span>
                        </div>
                    ))}
                </div>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Bir şoför seçin"
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
