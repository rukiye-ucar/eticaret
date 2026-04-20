import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import depthSensor from '../assets/non-back.png'; // Using existing asset as placeholder

const { Title, Paragraph } = Typography;

const categories = [
    {
        id: 1,
        title: 'Sensörler',
        categoryParam: 'Sensörler',
        description: 'Hassasiyet için tasarlanmış endüstriyel sınıf sensörler. Derinlik algılamadan çevresel izlemeye kadar güvenebileceğiniz veriler sunuyoruz.',
        image: depthSensor,
        gradient: 'linear-gradient(135deg, #8ba8cc 0%, #050b14 100%)'
    },
    {
        id: 2,
        title: 'Mekanik',
        categoryParam: 'Mekanik',
        description: 'Dayanıklılık için üretildi. Mekanik bileşenlerimiz sağlam malzemeleri kusursuz toleranslarla birleştirir, çünkü performans güvenilirlik gerektirir.',
        image: depthSensor,
        gradient: 'linear-gradient(135deg, #050b14 0%, #8ba8cc 100%)'
    },
    {
        id: 3,
        title: 'Elektronik',
        categoryParam: 'Elektronik',
        description: 'Her uygulama için son teknoloji elektronikler. En üst düzey üreticilerden temin edilen ve en zorlu projelerinizi güçlendirmek için titizlikle test edilmiş ürünler.',
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
