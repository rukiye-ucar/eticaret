import { useState, useEffect } from 'react';
import { Form, Input, Button, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';
import logo from '../assets/non-back.png';

const AuthPage = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { message } = App.useApp();

    useEffect(() => {
        setMode(location.pathname === '/register' ? 'register' : 'login');
    }, [location.pathname]);

    const switchMode = (newMode) => {
        if (newMode === mode) return;
        setAnimating(true);
        setTimeout(() => {
            setMode(newMode);
            navigate(newMode === 'register' ? '/register' : '/login');
            setAnimating(false);
        }, 280);
    };

    const onLoginFinish = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email, password: values.password }),
            });
            if (res.ok) {
                const data = await res.json();
                if (login(data.token)) {
                    message.success('Hoş geldiniz!');
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    navigate(payload.role === 'Admin' ? '/admin/orders' : '/');
                } else {
                    message.error('Giriş başarısız, geçersiz token.');
                }
            } else {
                message.error('E-posta veya şifre hatalı.');
            }
        } catch {
            message.error('Giriş sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const onRegisterFinish = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: values.username, email: values.email, password: values.password }),
            });
            if (res.ok) {
                message.success('Kayıt başarılı! Lütfen giriş yapın.');
                switchMode('login');
            } else {
                const data = await res.json();
                message.error(data.message || 'Kayıt başarısız.');
            }
        } catch {
            message.error('Kayıt sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className={`auth-card ${animating ? 'auth-card--out' : 'auth-card--in'}`}>
                {/* Logo / Brand */}
                <div className="auth-brand">
                    <img src={logo} alt="Albatros Logo" className="auth-logo-img" />
                    <span className="auth-brand-name">ALBATROS</span>
                </div>

                {/* Tab switcher */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => switchMode('login')}
                    >
                        Giriş Yap
                    </button>
                    <button
                        className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => switchMode('register')}
                    >
                        Kayıt Ol
                    </button>
                    <div className={`auth-tab-indicator ${mode === 'register' ? 'right' : 'left'}`} />
                </div>

                {/* Form area */}
                <div className="auth-form-wrap">
                    {mode === 'login' ? (
                        <Form key="login" name="login_form" onFinish={onLoginFinish} layout="vertical" size="large">
                            <div className="auth-greeting">
                                <h2>Hoş geldiniz</h2>
                                <p>Alışverişe devam etmek için giriş yapın</p>
                            </div>
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: 'E-posta zorunludur!' }, { type: 'email', message: 'Geçerli bir e-posta girin!' }]}
                            >
                                <Input prefix={<MailOutlined className="auth-input-icon" />} placeholder="E-posta adresi" className="auth-input" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Şifre zorunludur!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="auth-input-icon" />} placeholder="Şifre" className="auth-input" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button className="auth-submit-btn" htmlType="submit" loading={loading} block>
                                    Giriş Yap
                                </Button>
                            </Form.Item>
                            <p className="auth-switch-text">
                                Hesabınız yok mu?{' '}
                                <span onClick={() => switchMode('register')}>Kayıt olun</span>
                            </p>
                        </Form>
                    ) : (
                        <Form key="register" name="register_form" onFinish={onRegisterFinish} layout="vertical" size="large">
                            <div className="auth-greeting">
                                <h2>Hesap Oluştur</h2>
                                <p>Bize katılın ve hemen alışverişe başlayın</p>
                            </div>
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Kullanıcı adı zorunludur!' }]}
                            >
                                <Input prefix={<UserOutlined className="auth-input-icon" />} placeholder="Kullanıcı Adı" className="auth-input" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: 'E-posta zorunludur!' }, { type: 'email', message: 'Geçerli bir e-posta girin!' }]}
                            >
                                <Input prefix={<MailOutlined className="auth-input-icon" />} placeholder="E-posta adresi" className="auth-input" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Şifre zorunludur!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="auth-input-icon" />} placeholder="Şifre" className="auth-input" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button className="auth-submit-btn" htmlType="submit" loading={loading} block>
                                    Kayıt Ol
                                </Button>
                            </Form.Item>
                            <p className="auth-switch-text">
                                Zaten hesabınız var mı?{' '}
                                <span onClick={() => switchMode('login')}>Giriş yapın</span>
                            </p>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
