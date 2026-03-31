import { ConfigProvider, App as AntdApp } from 'antd';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import DriverManagement from './pages/admin/DriverManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import DriverPanel from './pages/driver/DriverPanel';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import MyAccount from './pages/MyAccount';
import About from './pages/About';
import bgImage from './assets/arkaplan.jpg';

const ConsumerLayout = () => (
  <div className="app-container">
    <div className="content-container">
      <Header />
      <Outlet />
    </div>
  </div>
);

const AuthLayout = () => (
  <div
    className="auth-layout-bg"
    style={{ backgroundImage: `url(${bgImage})` }}
  >
    <Header />
    <Outlet />
  </div>
);

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f9b17a',
          colorBgBase: '#2d2250',
          colorTextBase: '#ffffff',
          colorBgContainer: '#576f9d',
        },
      }}
    >
      <AntdApp>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Consumer Routes */}
              <Route element={<ConsumerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/account" element={<MyAccount />} />
                <Route path="/about" element={<About />} />
              </Route>

              {/* Driver Routes */}
              <Route path="/driver" element={<DriverLayout />}>
                <Route index element={<DriverPanel />} />
              </Route>

              {/* Auth Routes (with navbar) */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="drivers" element={<DriverManagement />} />
                <Route path="invoices" element={<InvoiceManagement />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;