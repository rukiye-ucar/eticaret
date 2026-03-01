import { useState, useEffect, useMemo } from 'react';
import { Button, Modal, InputNumber, App, Tag, Typography, Empty, Tabs, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CarOutlined, InboxOutlined, HistoryOutlined, CompassOutlined, ReloadOutlined } from '@ant-design/icons';
import RouteMap from './RouteMap';
import './DriverPanel.css';

const { Title, Text } = Typography;

const DriverPanel = () => {
    const { message } = App.useApp();
    const [deliveries, setDeliveries] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deliveredLoading, setDeliveredLoading] = useState(false);
    const [deliverModalVisible, setDeliverModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deliveredQuantity, setDeliveredQuantity] = useState(1);

    // Route map state
    const [optimizedRoute, setOptimizedRoute] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [driverLocation, setDriverLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

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
                message.error('Failed to load deliveries');
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

    // --- Route Optimization ---
    const fetchOptimizedRoute = async (lat, lng) => {
        setRouteLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/route/optimize?driverLat=${lat}&driverLng=${lng}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setOptimizedRoute(data.optimizedRoute || []);
                if ((data.optimizedRoute || []).length === 0) {
                    message.info('No delivery orders with location data found.');
                }
            } else {
                message.error('Failed to calculate route.');
            }
        } catch {
            message.error('Could not reach the server.');
        } finally {
            setRouteLoading(false);
        }
    };

    const handleGetRoute = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError('Your browser does not support geolocation.');
            return;
        }
        setRouteLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setDriverLocation({ lat: latitude, lng: longitude });
                fetchOptimizedRoute(latitude, longitude);
            },
            () => {
                setLocationError('Could not get location. Please check browser permissions.');
                setRouteLoading(false);
            }
        );
    };

    // Group delivered orders by customer
    const groupedDelivered = useMemo(() => {
        const groups = {};
        deliveredOrders.forEach(order => {
            const cid = order.customerId;
            if (!groups[cid]) {
                groups[cid] = {
                    customerId: cid,
                    customerName: order.customer?.name || order.customer?.email || `Customer #${cid}`,
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
            message.warning('Delivered quantity must be at least 1!');
            return;
        }
        if (deliveredQuantity > selectedOrder.quantity) {
            message.warning('Cannot deliver more than the order quantity!');
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
                message.success(result.message || 'Delivery confirmed!');
                setDeliverModalVisible(false);
                fetchDeliveries();
                fetchDeliveredOrders();
            } else {
                const error = await response.text();
                message.error(error || 'Delivery failed');
            }
        } catch (error) {
            console.error('Error delivering order:', error);
            message.error('An error occurred');
        }
    };

    const tabItems = [
        {
            key: 'pending',
            label: (
                <span className="dp-tab-label">
                    <CarOutlined />
                    Pending Deliveries
                    {deliveries.length > 0 && (
                        <span className="dp-tab-badge">{deliveries.length}</span>
                    )}
                </span>
            ),
            children: (
                <div>
                    {loading ? (
                        <div className="driver-empty"><Spin size="large" /></div>
                    ) : deliveries.length === 0 ? (
                        <div className="driver-empty">
                            <InboxOutlined />
                            <p>No deliveries assigned to you yet.</p>
                        </div>
                    ) : (
                        <div className="dp-card-list">
                            {deliveries.map(order => (
                                <div key={order.id} className="dp-delivery-card">
                                    <div className="dp-card-top">
                                        <span className="dp-order-id">#{order.id}</span>
                                        <Tag color="blue">{order.status?.toUpperCase()}</Tag>
                                    </div>
                                    <div className="dp-card-customer">
                                        <span className="dp-meta-label">Customer</span>
                                        <span className="dp-customer-label">{order.customer?.name || order.customer?.email || `Customer #${order.customerId}`}</span>
                                    </div>
                                    <div className="dp-card-product">
                                        {order.product?.imageUrl && (
                                            <img src={order.product.imageUrl} alt={order.product?.name} className="dp-product-thumb" />
                                        )}
                                        <span className="dp-product-name">{order.product?.name || `Product #${order.productId}`}</span>
                                    </div>
                                    <div className="dp-card-meta">
                                        <div className="dp-meta-item">
                                            <span className="dp-meta-label">Qty</span>
                                            <span className="dp-meta-value">x{order.quantity}</span>
                                        </div>
                                        <div className="dp-meta-item">
                                            <span className="dp-meta-label">Total</span>
                                            <span className="dp-meta-value price">${order.totalPrice}</span>
                                        </div>
                                        <div className="dp-meta-item">
                                            <span className="dp-meta-label">Date</span>
                                            <span className="dp-meta-value">{new Date(order.orderDate).toLocaleDateString('en-US')}</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="deliver-btn"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleDeliverClick(order)}
                                        block
                                    >
                                        Deliver
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'delivered',
            label: (
                <span className="dp-tab-label">
                    <HistoryOutlined />
                    Delivered Orders
                    {groupedDelivered.length > 0 && (
                        <span className="dp-tab-badge dp-tab-badge-green">{deliveredOrders.length}</span>
                    )}
                </span>
            ),
            children: (
                <div>
                    {deliveredLoading ? (
                        <div className="driver-empty"><Spin size="large" /></div>
                    ) : groupedDelivered.length === 0 ? (
                        <div className="driver-empty">
                            <InboxOutlined />
                            <p>No completed deliveries yet.</p>
                        </div>
                    ) : (
                        <div className="dp-card-list">
                            {groupedDelivered.map(group => (
                                <div key={group.customerId} className="dp-delivered-card">
                                    <div className="dp-delivered-header">
                                        <span className="dp-customer-name">{group.customerName}</span>
                                        <span className="dp-customer-total">${group.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="dp-delivered-orders">
                                        {group.orders.map(order => (
                                            <div key={order.id} className="dp-delivered-row" style={{ borderLeft: `3px solid ${order.status === 'Delivered' ? '#52c41a' : '#722ed1'}` }}>
                                                <span className="dp-dr-name">{order.product?.name || `Product #${order.productId}`}</span>
                                                <div className="dp-dr-right">
                                                    <span className="dp-dr-qty">x{order.deliveredQuantity}/{order.quantity}</span>
                                                    <span className="dp-dr-price">${order.totalPrice}</span>
                                                    <Tag color={order.status === 'Delivered' ? 'green' : 'purple'} style={{ margin: 0 }}>
                                                        {order.status === 'Delivered' ? 'FULL' : 'PARTIAL'}
                                                    </Tag>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'route',
            label: (
                <span>
                    <CompassOutlined style={{ marginRight: 8 }} />
                    Route Map
                    {optimizedRoute && optimizedRoute.length > 0 && (
                        <Tag color="geekblue" style={{ marginLeft: 8 }}>{optimizedRoute.length} Stops</Tag>
                    )}
                </span>
            ),
            children: (
                <div className="route-tab-content">
                    {/* Controls */}
                    <div className="route-controls">
                        <div className="route-controls-left">
                            <div className="route-info-text">
                                <CompassOutlined style={{ color: '#4a9eff', fontSize: '1.2rem' }} />
                                <div>
                                    <strong>Optimized Route</strong>
                                    <p>Generate the shortest delivery route using your location.</p>
                                </div>
                            </div>
                        </div>
                        <button
                            className="route-optimize-btn"
                            onClick={handleGetRoute}
                            disabled={routeLoading}
                        >
                            {routeLoading ? (
                                <><Spin size="small" /> Calculating...</>
                            ) : (
                                <><ReloadOutlined /> {optimizedRoute ? 'Refresh Route' : '📍 Start Route'}</>
                            )}
                        </button>
                    </div>

                    {locationError && (
                        <Alert
                            type="error"
                            message={locationError}
                            showIcon
                            style={{ marginBottom: 16, borderRadius: 10 }}
                        />
                    )}

                    {/* Route stops summary */}
                    {optimizedRoute && optimizedRoute.length > 0 && (
                        <div className="route-stops-list">
                            <div className="route-stops-header">📋 Delivery Order</div>
                            {optimizedRoute.map((stop) => (
                                <div key={stop.orderId} className="route-stop-item">
                                    <div className="route-stop-seq">{stop.sequence}</div>
                                    <div className="route-stop-info">
                                        <div className="route-stop-customer">👤 {stop.customerName}</div>
                                        <div className="route-stop-address">📍 {stop.address}</div>
                                        <div className="route-stop-product">📦 {stop.productName} × {stop.quantity}</div>
                                    </div>
                                    <div className="route-stop-price">${stop.totalPrice}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Map */}
                    {optimizedRoute !== null && driverLocation && (
                        <RouteMap
                            optimizedRoute={optimizedRoute}
                            driverLat={driverLocation.lat}
                            driverLng={driverLocation.lng}
                        />
                    )}

                    {optimizedRoute === null && !routeLoading && (
                        <div className="route-placeholder">
                            <div className="route-placeholder-icon">🗺️</div>
                            <p>Click the button above to view the route.</p>
                            <p className="route-placeholder-hint">The shortest path based on your location will be calculated.</p>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="driver-panel">
            {/* Header */}
            <div className="driver-header">
                <Title level={2} style={{ margin: 0 }}>🚚 My Deliveries</Title>
                <Text type="secondary">View and confirm orders assigned to you.</Text>
            </div>

            {/* Stats */}
            <div className="driver-stats">
                <div className="driver-stat-card">
                    <div className="stat-icon shipped">
                        <CarOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>{deliveries.length}</h3>
                        <span>Pending Deliveries</span>
                    </div>
                </div>
                <div className="driver-stat-card">
                    <div className="stat-icon delivered">
                        <CheckCircleOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>{deliveredOrders.length}</h3>
                        <span>Delivered</span>
                    </div>
                </div>
                <div className="driver-stat-card">
                    <div className="stat-icon partial">
                        <HistoryOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>{pendingCustomerCount}</h3>
                        <span>Remaining Customers</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultActiveKey="pending" items={tabItems} size="large" />

            {/* Deliver Modal */}
            <Modal
                title="Confirm Delivery"
                open={deliverModalVisible}
                onOk={handleDeliverSubmit}
                onCancel={() => setDeliverModalVisible(false)}
                okText="Deliver"
                cancelText="Cancel"
                className="deliver-modal"
            >
                {selectedOrder && (
                    <div>
                        <div className="order-detail-row">
                            <span className="label">Product:</span>
                            <span className="value">{selectedOrder.product?.name || `Product #${selectedOrder.productId}`}</span>
                        </div>
                        <div className="order-detail-row">
                            <span className="label">Order Qty:</span>
                            <span className="value">x{selectedOrder.quantity}</span>
                        </div>
                        <div className="order-detail-row">
                            <span className="label">Total Price:</span>
                            <span className="value">${selectedOrder.totalPrice}</span>
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Delivered Quantity:
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
                                    ⚠️ Partial delivery. {selectedOrder.quantity - deliveredQuantity} unit(s) will be short.
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
