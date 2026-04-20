import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Spin, message } from 'antd';
import { RiseOutlined, FireOutlined, ExceptionOutlined } from '@ant-design/icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const { Title: TypographyTitle } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalRevenue: 0,
        totalProfit: 0,
        dailySales: 0,
        pendingOrdersCount: 0,
        dailySalesChart: [],
        topProducts: [],
        topCategories: []
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const stats = await res.json();
                    setData(stats);
                } else {
                    message.error('Veriler alınamadı.');
                }
            } catch (err) {
                console.error(err);
                message.error('Bağlantı hatası.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    }

    // Chart Data Preparation
    const lineChartData = {
        labels: data.dailySalesChart.map(x => x.date),
        datasets: [
            {
                label: 'Günlük Gelir (TL)',
                data: data.dailySalesChart.map(x => x.revenue),
                borderColor: 'rgb(249, 177, 122)',
                backgroundColor: 'rgba(249, 177, 122, 0.5)',
                tension: 0.3, // Curve
                fill: true,
            }
        ]
    };

    const pieChartData = {
        labels: data.topCategories.map(x => x.categoryName),
        datasets: [
            {
                label: 'Satılan Adet',
                data: data.topCategories.map(x => x.totalSold),
                backgroundColor: [
                    '#576f9d', '#2d2250', '#f9b17a', '#7cb305', '#13c2c2', '#eb2f96'
                ],
                borderWidth: 1,
            }
        ]
    };

    const productCols = [
        { title: 'Ürün Adı', dataIndex: 'productName', key: 'productName' },
        { title: 'Toplam Satış', dataIndex: 'totalSold', key: 'totalSold', align: 'center' },
    ];

    const categoryCols = [
        { title: 'Kategori Adı', dataIndex: 'categoryName', key: 'categoryName' },
        { title: 'Toplam Satış', dataIndex: 'totalSold', key: 'totalSold', align: 'center' },
    ];

    return (
        <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh', borderRadius: 8 }}>
            <TypographyTitle level={2} style={{ marginBottom: 24, color: '#1a1040' }}>Ana Panel</TypographyTitle>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title={<span style={{ color: '#ffffff', opacity: 0.85 }}>Toplam Gelir</span>}
                            value={data.totalRevenue}
                            precision={2}
                            prefix="₺"
                            styles={{ content: { color: '#ffffff', fontWeight: 'bold' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title={<span style={{ color: '#ffffff', opacity: 0.85 }}>Toplam Kâr</span>}
                            value={data.totalProfit}
                            precision={2}
                            prefix={<RiseOutlined />}
                            styles={{ content: { color: '#b7eb8f', fontWeight: 'bold' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title={<span style={{ color: '#ffffff', opacity: 0.85 }}>Bugünkü Satışlar</span>}
                            value={data.dailySales}
                            precision={2}
                            prefix={<FireOutlined />}
                            styles={{ content: { color: '#ffa39e', fontWeight: 'bold' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title={<span style={{ color: '#ffffff', opacity: 0.85 }}>Bekleyen Siparişler</span>}
                            value={data.pendingOrdersCount}
                            prefix={<ExceptionOutlined />}
                            styles={{ content: { color: '#ffe58f', fontWeight: 'bold' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title={<span style={{ color: '#ffffff' }}>Son 7 Günlük Satış Trendi</span>} variant="borderless" style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ height: 300 }}>
                            <Line data={lineChartData} options={{
                                maintainAspectRatio: false,
                                scales: {
                                    x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                    y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                                },
                                plugins: { legend: { display: false } }
                            }} />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title={<span style={{ color: '#ffffff' }}>Kategori Satış Dağılımı</span>} variant="borderless" style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Pie data={pieChartData} options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { color: '#ffffff' } } }
                            }} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Lists */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title={<span style={{ color: '#ffffff' }}>En Çok Satan Ürünler</span>} variant="borderless" style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Table
                            columns={productCols}
                            dataSource={data.topProducts}
                            rowKey="productName"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={<span style={{ color: '#ffffff' }}>En Çok Satan Kategoriler</span>} variant="borderless" style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Table
                            columns={categoryCols}
                            dataSource={data.topCategories}
                            rowKey="categoryName"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
