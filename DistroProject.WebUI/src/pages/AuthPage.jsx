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
                    message.success('Welcome back!');
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    navigate(payload.role === 'Admin' ? '/admin/orders' : '/');
                } else {
                    message.error('Login failed, invalid token.');
                }
            } else {
                message.error('Invalid email or password.');
            }
        } catch {
            message.error('An error occurred during login.');
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
                message.success('Registration successful! Please sign in.');
                switchMode('login');
            } else {
                const data = await res.json();
                message.error(data.message || 'Registration failed.');
            }
        } catch {
            message.error('An error occurred during registration.');
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
                        Sign In
                    </button>
                    <button
                        className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => switchMode('register')}
                    >
                        Sign Up
                    </button>
                    <div className={`auth-tab-indicator ${mode === 'register' ? 'right' : 'left'}`} />
                </div>

                {/* Form area */}
                <div className="auth-form-wrap">
                    {mode === 'login' ? (
                        <Form key="login" name="login_form" onFinish={onLoginFinish} layout="vertical" size="large">
                            <div className="auth-greeting">
                                <h2>Welcome back 👋</h2>
                                <p>Sign in to continue shopping</p>
                            </div>
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: 'Email is required!' }, { type: 'email', message: 'Enter a valid email!' }]}
                            >
                                <Input prefix={<MailOutlined className="auth-input-icon" />} placeholder="Email address" className="auth-input" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Password is required!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="auth-input-icon" />} placeholder="Password" className="auth-input" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button className="auth-submit-btn" htmlType="submit" loading={loading} block>
                                    Sign In
                                </Button>
                            </Form.Item>
                            <p className="auth-switch-text">
                                Don't have an account?{' '}
                                <span onClick={() => switchMode('register')}>Sign up</span>
                            </p>
                        </Form>
                    ) : (
                        <Form key="register" name="register_form" onFinish={onRegisterFinish} layout="vertical" size="large">
                            <div className="auth-greeting">
                                <h2>Create account ✨</h2>
                                <p>Join us and start shopping today</p>
                            </div>
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Username is required!' }]}
                            >
                                <Input prefix={<UserOutlined className="auth-input-icon" />} placeholder="Username" className="auth-input" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: 'Email is required!' }, { type: 'email', message: 'Enter a valid email!' }]}
                            >
                                <Input prefix={<MailOutlined className="auth-input-icon" />} placeholder="Email address" className="auth-input" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Password is required!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="auth-input-icon" />} placeholder="Password" className="auth-input" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button className="auth-submit-btn" htmlType="submit" loading={loading} block>
                                    Create Account
                                </Button>
                            </Form.Item>
                            <p className="auth-switch-text">
                                Already have an account?{' '}
                                <span onClick={() => switchMode('login')}>Sign in</span>
                            </p>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
