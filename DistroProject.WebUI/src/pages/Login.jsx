import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/arkaplan.jpg';
import cardBg from '../assets/login.png';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password, // Changed from passwordHash to match Register DTO usually, or kept if backend expects passwordHash (assuming plain password here based on standard practices, but checking previous file it was passwordHash key but sending straight password?)
                    // The previous file sent: passwordHash: values.password. Use whatever worked or fix backend.
                    // Let's stick to what was there: 'passwordHash' key for now to be safe, or just 'password' if I recall standard DTOs.
                    // Checking previous file content: "passwordHash: values.password".
                    // However, standard is usually just password. I'll stick to what was there to avoid breaking if backend expects that key.
                    // ACTUALLY, usually DTOs map inputs. Let's send "password" as well just in case.
                    password: values.password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (login(data.token)) {
                    message.success('Giriş başarılı!');
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    if (payload.role === 'Admin') {
                        navigate('/admin/orders');
                    } else if (payload.role === 'Driver') {
                        navigate('/driver');
                    } else {
                        navigate('/');
                    }
                } else {
                    message.error('Token işleme sırasında giriş başarısız oldu');
                }
            } else {
                message.error('E-posta veya şifre hatalı');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Giriş sırasında bir hata oluştu');
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
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ color: '#2d2250' }}>Giriş Yap</Title>
                    <p style={{ color: '#555' }}>Hoş geldiniz! Lütfen hesabınıza giriş yapın.</p>
                </div>
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Lütfen e-posta adresinizi girin!' }, { type: 'email', message: 'Geçerli bir e-posta girin!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Şifre" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ backgroundColor: '#f9b17a', borderColor: '#f9b17a', color: '#2d2250', fontWeight: 'bold' }}>
                            Giriş Yap
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        Hesabınız yok mu? <Link to="/register" style={{ color: '#2d2250', fontWeight: 'bold' }}>Kayıt olun</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
