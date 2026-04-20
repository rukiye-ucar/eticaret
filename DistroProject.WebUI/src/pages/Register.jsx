import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from '../assets/arkaplan.jpg';
import cardBg from '../assets/login.png';

const { Title } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                }),
            });

            if (response.ok) {
                message.success('Kayıt başarılı! Lütfen giriş yapın.');
                navigate('/login');
            } else {
                const data = await response.json();
                message.error(data.message || 'Kayıt başarısız oldu');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error('Kayıt sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <Card style={{
                width: 400,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                backgroundImage: `url(${cardBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.9)' // Fallback / Blend
            }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ color: '#2d2250' }}>Kayıt Ol</Title>
                    <p style={{ color: '#555' }}>Hesabınızı oluşturun ve alışverişe başlayın.</p>
                </div>
                <Form
                    name="register_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Kullanıcı Adı" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Lütfen e-posta adresinizi girin!' }, { type: 'email', message: 'Geçerli bir e-posta girin!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Şifre" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ backgroundColor: '#f9b17a', borderColor: '#f9b17a', color: '#2d2250', fontWeight: 'bold' }}>
                            Kayıt Ol
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        Zaten hesabınız var mı? <Link to="/login" style={{ color: '#2d2250', fontWeight: 'bold' }}>Giriş yapın</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
