import { useState, useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Statistic, Tabs, message } from 'antd';
import { DollarOutlined, ExperimentOutlined, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const FinanceManagement = () => {
    const [totalProfit, setTotalProfit] = useState(0);
    const [productProfits, setProductProfits] = useState([]);
    const [orderProfits, setOrderProfits] = useState([]);
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Total Profit
            const resTotal = await fetch(`${import.meta.env.VITE_API_BASE_URL}/finance/total-profit`, { headers });
            if (resTotal.ok) {
                const data = await resTotal.json();
                setTotalProfit(data.totalProfit || 0);
            }

            // Fetch Product Profit
            const resProduct = await fetch(`${import.meta.env.VITE_API_BASE_URL}/finance/product-profit`, { headers });
            if (resProduct.ok) {
                setProductProfits(await resProduct.json());
            }

            // Fetch Order Profit
            const resOrder = await fetch(`${import.meta.env.VITE_API_BASE_URL}/finance/order-profit`, { headers });
            if (resOrder.ok) {
                setOrderProfits(await resOrder.json());
            }

            // Fetch Debts
            const resDebts = await fetch(`${import.meta.env.VITE_API_BASE_URL}/finance/debts`, { headers });
            if (resDebts.ok) {
                setDebts(await resDebts.json());
            }
        } catch (error) {
            console.error('Veriler çekilirken hata oluştu:', error);
            message.error('Finans verileri yüklenirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const orderColumns = [
        { title: 'Sipariş No', dataIndex: 'orderId', key: 'orderId', width: 100 },
        { title: 'Tarih', dataIndex: 'orderDate', key: 'orderDate', render: (val) => val ? new Date(val).toLocaleDateString('tr-TR') : '-' },
        { title: 'Müşteri', dataIndex: 'customerName', key: 'customerName' },
        { title: 'Ürün', dataIndex: 'productName', key: 'productName' },
        { title: 'Adet', dataIndex: 'quantity', key: 'quantity', align: 'center' },
        { 
            title: 'Net Kar', 
            dataIndex: 'profit', 
            key: 'profit', 
            align: 'right',
            render: (val) => <Text type="success" strong>${Number(val).toFixed(2)}</Text>
        },
    ];

    const productColumns = [
        { title: 'ID', dataIndex: 'productId', key: 'productId', width: 80 },
        { title: 'Ürün Adı', dataIndex: 'productName', key: 'productName' },
        { title: 'Toplam Satılan (Adet)', dataIndex: 'totalSoldQuantity', key: 'totalSoldQuantity', align: 'center' },
        { 
            title: 'Toplam Kar', 
            dataIndex: 'totalProfit', 
            key: 'totalProfit',
            align: 'right',
            render: (val) => <Text type="success" strong>${Number(val).toFixed(2)}</Text>
        },
    ];

    const debtColumns = [
        { title: 'Müşteri No', dataIndex: 'id', key: 'id', width: 100 },
        { title: 'Müşteri Adı', dataIndex: 'name', key: 'name' },
        { title: 'E-Posta', dataIndex: 'email', key: 'email' },
        { 
            title: 'Toplam Borç', 
            dataIndex: 'debtAmount', 
            key: 'debtAmount',
            align: 'right',
            render: (val) => <Text type="danger" strong>${Number(val).toFixed(2)}</Text>
        },
    ];

    const expandedRowRender = (record) => {
        const columns = [
            { title: 'Sipariş No', dataIndex: 'id', key: 'id' },
            { title: 'Ürün', dataIndex: 'productName', key: 'productName' },
            { title: 'Adet', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Sipariş Tarihi', dataIndex: 'orderDate', key: 'orderDate' },
            { 
                title: 'Tutar', 
                dataIndex: 'totalPrice', 
                key: 'totalPrice',
                render: val => `$${Number(val).toFixed(2)}`
            },
        ];
        return <Table columns={columns} dataSource={record.unpaidOrders} rowKey="id" pagination={false} size="small" />;
    };

    const tabItems = [
        {
            key: '1',
            label: <span><ExperimentOutlined /> Ürün Bazlı Kar Analizi</span>,
            children: (
                <Table 
                    columns={productColumns} 
                    dataSource={productProfits} 
                    rowKey="productId" 
                    pagination={{ pageSize: 10 }} 
                    loading={loading}
                    bordered
                    size="middle"
                />
            )
        },
        {
            key: '2',
            label: <span><ShoppingCartOutlined /> Sipariş Karlılık Geçmişi</span>,
            children: (
                <Table 
                    columns={orderColumns} 
                    dataSource={orderProfits} 
                    rowKey="orderId" 
                    pagination={{ pageSize: 10 }} 
                    loading={loading}
                    bordered
                    size="middle"
                />
            )
        },
        {
            key: '3',
            label: <span><CreditCardOutlined /> Müşteri Borçları (Premium)</span>,
            children: (
                <Table 
                    columns={debtColumns} 
                    dataSource={debts} 
                    rowKey="id" 
                    expandable={{ expandedRowRender }}
                    pagination={{ pageSize: 10 }} 
                    loading={loading}
                    bordered
                    size="middle"
                />
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>📊 Finans ve Kar Analizi</Title>
                <Text type="secondary">Satış ve alış fiyatı (cost) arasındaki farka dayanarak hesaplanan sistem genelindeki kar metrikleri.</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: '#f6ffed', borderColor: '#b7eb8f' }}>
                        <Statistic
                            title={<span style={{ fontWeight: 600, color: '#389e0d', fontSize: '1.2rem' }}>Toplam Kar (Net)</span>}
                            value={totalProfit}
                            precision={2}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Tabs defaultActiveKey="1" items={tabItems} size="large" />
            </Card>
        </div>
    );
};

export default FinanceManagement;
