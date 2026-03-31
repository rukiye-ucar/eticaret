import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import depthSensor from '../assets/non-back.png'; // Using existing asset as placeholder

const { Title, Paragraph } = Typography;

const categories = [
    {
        id: 1,
        title: 'Sensors',
        categoryParam: 'Sensors',
        description: 'Industry-grade sensors engineered for precision. From depth perception to environmental monitoring — we deliver data you can trust.',
        image: depthSensor,
        gradient: 'linear-gradient(135deg, #8ba8cc 0%, #050b14 100%)'
    },
    {
        id: 2,
        title: 'Mechanical',
        categoryParam: 'Mechanical',
        description: 'Built to endure. Our mechanical components combine robust materials with flawless tolerances — because performance demands reliability.',
        image: depthSensor,
        gradient: 'linear-gradient(135deg, #050b14 0%, #8ba8cc 100%)'
    },
    {
        id: 3,
        title: 'Electronics',
        categoryParam: 'Electronics',
        description: 'Cutting-edge electronics for every application. Sourced from top-tier manufacturers and rigorously tested to power your most demanding projects.',
        image: depthSensor,
        gradient: 'linear-gradient(135deg, #8ba8cc 0%, #050b14 100%)'
    }
];

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
            {categories.map((category) => {
                const isEven = category.id % 2 === 0;
                return (
                    <div
                        key={category.id}
                        className="category-card"
                        onClick={() => navigate(`/products?category=${encodeURIComponent(category.categoryParam)}`)}
                        style={{
                            background: category.gradient,
                        }}
                    >
                        <div
                            className="card-content"
                            style={{
                                flexDirection: isEven ? 'row-reverse' : 'row',
                                textAlign: 'left'
                            }}
                        >
                            <div
                                className="text-section"
                                style={{
                                    paddingRight: isEven ? 0 : '20px',
                                    paddingLeft: isEven ? '120px' : 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Title level={4} style={{ color: '#f9b17a', marginBottom: '10px' }}>
                                    {category.title}
                                </Title>
                                <Paragraph style={{ color: '#e0e0e0', fontSize: '14px', maxWidth: '300px' }}>
                                    {category.description}
                                </Paragraph>
                            </div>
                            <div className="image-section">
                                <img src={category.image} alt={category.title} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Home;
