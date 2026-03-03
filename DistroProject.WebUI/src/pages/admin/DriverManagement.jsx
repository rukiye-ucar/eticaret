import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Spin, Tag, Empty, Collapse } from 'antd';
import { CarOutlined, UserOutlined, ShoppingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './DriverManagement.css';

const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const DriverManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/orders/all`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setOrders(await res.json());
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const driverGroups = useMemo(() => {
        const assigned = orders.filter(o => o.driverId);
        const groups = {};
        assigned.forEach(order => {
            const dId = order.driverId;
            if (!groups[dId]) {
                groups[dId] = {
                    driverId: dId,
                    driverName: order.driver?.name || order.driver?.email || `Driver #${dId}`,
                    customers: {},
                    totalOrders: 0,
                    deliveredCount: 0,
                    pendingCount: 0,
                };
            }
            const group = groups[dId];
            group.totalOrders++;
            if (order.status === 'Delivered' || order.status === 'PartialDelivered') {
                group.deliveredCount++;
            } else {
                group.pendingCount++;
            }
            const cId = order.customerId;
            if (!group.customers[cId]) {
                group.customers[cId] = {
                    customerId: cId,
                    customerName: order.customer?.name || order.customer?.email || `Customer #${cId}`,
                    orders: [],
                };
            }
            group.customers[cId].orders.push(order);
        });
        Object.values(groups).forEach(g => { g.customerList = Object.values(g.customers); delete g.customers; });
        return Object.values(groups).sort((a, b) => b.driverId - a.driverId);
    }, [orders]);

    const getStatusTag = (status) => {
        const map = {
            Pending: { color: 'orange', text: 'Pending' },
            Approved: { color: 'blue', text: 'Approved' },
            Shipped: { color: 'cyan', text: 'Shipped' },
            Delivered: { color: 'green', text: 'Delivered' },
            PartialDelivered: { color: 'purple', text: 'Partial' },
        };
        const info = map[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
    };

    const getImageUrl = (img, contentType) => {
        if (!img) return null;
        if (typeof img === 'string' && img.startsWith('http')) return img;
        return `data:${contentType || 'image/png'};base64,${img}`;
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
    );

    return (
        <div className="driver-mgmt-page">
            <div className="driver-mgmt-header">
                <Title level={2} style={{ margin: 0, color: '#1a1a2e' }}>
                    <CarOutlined style={{ marginRight: 12, color: '#f9b17a' }} />
                    Driver Management
                </Title>
                <Text style={{ color: '#aab8d0' }}>View driver deliveries grouped by customer</Text>
            </div>

            {/* Stats */}
            <div className="driver-mgmt-stats">
                <div className="dm-stat-card">
                    <CarOutlined className="dm-stat-icon" />
                    <div>
                        <h3>{driverGroups.length}</h3>
                        <span>Active Drivers</span>
                    </div>
                </div>
                <div className="dm-stat-card">
                    <ShoppingOutlined className="dm-stat-icon delivered" />
                    <div>
                        <h3>{driverGroups.reduce((s, d) => s + d.totalOrders, 0)}</h3>
                        <span>Total Orders</span>
                    </div>
                </div>
                <div className="dm-stat-card">
                    <CheckCircleOutlined className="dm-stat-icon success" />
                    <div>
                        <h3>{driverGroups.reduce((s, d) => s + d.deliveredCount, 0)}</h3>
                        <span>Delivered</span>
                    </div>
                </div>
            </div>

            {driverGroups.length === 0 ? (
                <Empty description="No orders assigned to any driver yet." />
            ) : (
                <Collapse
                    className="driver-collapse"
                    accordion
                    items={driverGroups.map(driver => ({
                        key: driver.driverId,
                        label: (
                            <div className="driver-collapse-header">
                                <div className="driver-name-section">
                                    <CarOutlined style={{ color: '#f9b17a', fontSize: 18 }} />
                                    <span className="driver-name">{driver.driverName}</span>
                                </div>
                                <div className="driver-badges">
                                    <Tag color="blue">{driver.totalOrders} orders</Tag>
                                    <Tag color="cyan">{driver.pendingCount} pending</Tag>
                                    <Tag color="green">{driver.deliveredCount} delivered</Tag>
                                    <Tag color="orange">{driver.customerList.length} customers</Tag>
                                </div>
                            </div>
                        ),
                        children: (
                            <div className="driver-customers">
                                {driver.customerList.map(customer => (
                                    <div key={customer.customerId} className="customer-block">
                                        <div className="customer-header">
                                            <UserOutlined style={{ color: '#f9b17a' }} />
                                            <span className="customer-name">{customer.customerName}</span>
                                            <Tag color="geekblue">{customer.orders.length} items</Tag>
                                        </div>
                                        <div className="customer-orders">
                                            {customer.orders.map(order => (
                                                <div key={order.id} className="order-row">
                                                    <div className="order-row-left">
                                                        {getImageUrl(order.product?.image, order.product?.imageContentType) ? (
                                                            <img
                                                                src={getImageUrl(order.product.image, order.product.imageContentType)}
                                                                alt={order.product?.name}
                                                                className="order-product-img"
                                                            />
                                                        ) : (
                                                            <div className="order-product-img placeholder">?</div>
                                                        )}
                                                        <div className="order-product-info">
                                                            <span className="order-product-name">
                                                                {order.product?.name || `Product #${order.productId}`}
                                                            </span>
                                                            <span className="order-product-qty">
                                                                Qty: {order.deliveredQuantity > 0
                                                                    ? `${order.deliveredQuantity}/${order.quantity}`
                                                                    : order.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="order-row-right">
                                                        <span className="order-price">${order.totalPrice}</span>
                                                        {getStatusTag(order.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ),
                    }))}
                />
            )}
        </div>
    );
};

export default DriverManagement;
