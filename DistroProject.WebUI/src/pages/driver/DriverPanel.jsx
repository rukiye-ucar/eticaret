import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, InputNumber, message, Tag, Typography, Empty, Tabs } from 'antd';
import { CheckCircleOutlined, CarOutlined, InboxOutlined, HistoryOutlined } from '@ant-design/icons';
import './DriverPanel.css';

const { Title, Text } = Typography;

const DriverPanel = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deliveredLoading, setDeliveredLoading] = useState(false);
    const [deliverModalVisible, setDeliverModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deliveredQuantity, setDeliveredQuantity] = useState(1);

    const token = localStorage.getItem('token');

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/my-deliveries`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDeliveries(data);
            } else {
                message.error('Teslimatlar yüklenemedi');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveredOrders = async () => {
        setDeliveredLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/my-delivered`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDeliveredOrders(data);
            }
        } catch (error) {
            console.error('Error fetching delivered orders:', error);
        } finally {
            setDeliveredLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
        fetchDeliveredOrders();
    }, []);

    // Group delivered orders by customer
    const groupedDelivered = useMemo(() => {
        const groups = {};
        deliveredOrders.forEach(order => {
            const cid = order.customerId;
            if (!groups[cid]) {
                groups[cid] = {
                    customerId: cid,
                    customerName: order.customer?.name || order.customer?.email || `Müşteri #${cid}`,
                    orders: [],
                    totalPrice: 0,
                };
            }
            groups[cid].orders.push(order);
            groups[cid].totalPrice += order.totalPrice;
        });
        return Object.values(groups);
    }, [deliveredOrders]);

    // Count unique customers from pending deliveries
    const pendingCustomerCount = useMemo(() => {
        const uniqueCustomers = new Set(deliveries.map(d => d.customerId));
        return uniqueCustomers.size;
    }, [deliveries]);

    const handleDeliverClick = (order) => {
        setSelectedOrder(order);
        setDeliveredQuantity(order.quantity);
        setDeliverModalVisible(true);
    };

    const handleDeliverSubmit = async () => {
        if (!selectedOrder) return;

        if (deliveredQuantity < 1) {
            message.warning('Teslim edilen miktar en az 1 olmalı!');
            return;
        }
        if (deliveredQuantity > selectedOrder.quantity) {
            message.warning('Sipariş miktarından fazla teslim edemezsiniz!');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/orders/deliver-order/${selectedOrder.id}?actualDeliveredQuantity=${deliveredQuantity}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const result = await response.json();
                message.success(result.message || 'Teslimat başarılı!');
                setDeliverModalVisible(false);
                fetchDeliveries();
                fetchDeliveredOrders();
            } else {
                const error = await response.text();
                message.error(error || 'Teslimat başarısız');
            }
        } catch (error) {
            console.error('Error delivering order:', error);
            message.error('Bir hata oluştu');
        }
    };

    // ─── Pending deliveries columns ───
    const pendingColumns = [
        {
            title: 'Sipariş No',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id) => <span style={{ fontWeight: 700, color: '#f9b17a' }}>#{id}</span>,
        },
        {
            title: 'Ürün',
            key: 'product',
            width: 280,
            render: (_, record) => (
                <div className="delivery-product-info">
                    {record.product?.imageUrl && (
                        <img src={record.product.imageUrl} alt={record.product?.name} className="product-thumb" />
                    )}
                    <span className="product-name">{record.product?.name || `Ürün #${record.productId}`}</span>
                </div>
            ),
        },
        {
            title: 'Miktar',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (qty) => <span style={{ fontWeight: 600, fontSize: '1rem' }}>x{qty}</span>,
        },
        {
            title: 'Toplam Fiyat',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 130,
            render: (price) => <span style={{ fontWeight: 700, color: '#f9b17a', fontSize: '1.05rem' }}>${price}</span>,
        },
        {
            title: 'Sipariş Tarihi',
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 130,
            render: (date) => <span style={{ color: '#aab8d0' }}>{new Date(date).toLocaleDateString('tr-TR')}</span>,
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: (status) => <Tag color="blue">{status.toUpperCase()}</Tag>,
        },
        {
            title: 'İşlem',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Button className="deliver-btn" icon={<CheckCircleOutlined />} onClick={() => handleDeliverClick(record)}>
                    Teslim Et
                </Button>
            ),
        },
    ];

    // ─── Delivered (grouped by customer) columns ───
    const deliveredColumns = [
        {
            title: 'Müşteri',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 180,
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#f9b17a', fontSize: '1rem' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8a8fb0' }}>
                        {record.orders.length} sipariş
                    </div>
                </div>
            ),
        },
        {
            title: 'Teslim Edilen Ürünler',
            key: 'products',
            width: 420,
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
                            borderLeft: `3px solid ${order.status === 'Delivered' ? '#52c41a' : '#722ed1'}`,
                        }}>
                            <span style={{ flex: 1, fontWeight: 500 }}>
                                {order.product?.name || `Ürün #${order.productId}`}
                            </span>
                            <span style={{ color: '#aab8d0', margin: '0 8px', whiteSpace: 'nowrap' }}>
                                x{order.deliveredQuantity}/{order.quantity}
                            </span>
                            <span style={{ color: '#f9b17a', fontWeight: 600, whiteSpace: 'nowrap', marginRight: 8 }}>
                                ${order.totalPrice}
                            </span>
                            <Tag color={order.status === 'Delivered' ? 'green' : 'purple'} style={{ margin: 0 }}>
                                {order.status === 'Delivered' ? 'TAM' : 'KISMİ'}
                            </Tag>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Toplam',
            key: 'totalPrice',
            width: 120,
            render: (_, record) => (
                <span style={{ fontWeight: 700, color: '#f9b17a', fontSize: '1.1rem' }}>
                    ${record.totalPrice.toFixed(2)}
                </span>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'pending',
            label: (
                <span>
                    <CarOutlined style={{ marginRight: 8 }} />
                    Bekleyen Teslimatlar
                    {deliveries.length > 0 && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>{deliveries.length}</Tag>
                    )}
                </span>
            ),
            children: (
                <div>
                    {deliveries.length > 0 ? (
                        <Table
                            columns={pendingColumns}
                            dataSource={deliveries}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    ) : (
                        !loading && (
                            <div className="driver-empty">
                                <InboxOutlined />
                                <p>Henüz size atanmış teslimat bulunmuyor.</p>
                            </div>
                        )
                    )}
                </div>
            ),
        },
        {
            key: 'delivered',
            label: (
                <span>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    Teslim Edilenler
                    {groupedDelivered.length > 0 && (
                        <Tag color="green" style={{ marginLeft: 8 }}>{deliveredOrders.length}</Tag>
                    )}
                </span>
            ),
            children: (
                <div>
                    {groupedDelivered.length > 0 ? (
                        <Table
                            columns={deliveredColumns}
                            dataSource={groupedDelivered}
                            rowKey="customerId"
                            loading={deliveredLoading}
                            pagination={{ pageSize: 10 }}
                        />
                    ) : (
                        !deliveredLoading && (
                            <div className="driver-empty">
                                <InboxOutlined />
                                <p>Henüz tamamlanmış teslimat bulunmuyor.</p>
                            </div>
                        )
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="driver-panel">
            {/* Header */}
            <div className="driver-header">
                <Title level={2} style={{ margin: 0 }}>🚚 Teslimatlarım</Title>
                <Text type="secondary">Size atanan siparişleri buradan görüntüleyebilir ve teslim edebilirsiniz.</Text>
            </div>

            {/* Stats */}
            <div className="driver-stats">
                <div className="driver-stat-card">
                    <div className="stat-icon shipped">
                        <CarOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>{deliveries.length}</h3>
                        <span>Bekleyen Teslimat</span>
                    </div>
                </div>
                <div className="driver-stat-card">
                    <div className="stat-icon delivered">
                        <CheckCircleOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>{deliveredOrders.length}</h3>
                        <span>Teslim Edildi</span>
                    </div>
                </div>
                <div className="driver-stat-card">
                    <div className="stat-icon partial">
                        <HistoryOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>{pendingCustomerCount}</h3>
                        <span>Kalan Müşteri</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultActiveKey="pending" items={tabItems} size="large" />

            {/* Deliver Modal */}
            <Modal
                title="Teslimat Onayla"
                open={deliverModalVisible}
                onOk={handleDeliverSubmit}
                onCancel={() => setDeliverModalVisible(false)}
                okText="Teslim Et"
                cancelText="İptal"
                className="deliver-modal"
            >
                {selectedOrder && (
                    <div>
                        <div className="order-detail-row">
                            <span className="label">Ürün:</span>
                            <span className="value">{selectedOrder.product?.name || `Ürün #${selectedOrder.productId}`}</span>
                        </div>
                        <div className="order-detail-row">
                            <span className="label">Sipariş Miktarı:</span>
                            <span className="value">x{selectedOrder.quantity}</span>
                        </div>
                        <div className="order-detail-row">
                            <span className="label">Toplam Fiyat:</span>
                            <span className="value">${selectedOrder.totalPrice}</span>
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Teslim Edilen Miktar:
                            </Text>
                            <InputNumber
                                min={1}
                                max={selectedOrder.quantity}
                                value={deliveredQuantity}
                                onChange={(val) => setDeliveredQuantity(val)}
                                style={{ width: '100%' }}
                                size="large"
                            />
                            {deliveredQuantity < selectedOrder.quantity && (
                                <Text type="warning" style={{ display: 'block', marginTop: 8, fontSize: '0.85rem' }}>
                                    ⚠️ Kısmi teslimat yapılacak. {selectedOrder.quantity - deliveredQuantity} adet eksik kalacak.
                                </Text>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DriverPanel;
