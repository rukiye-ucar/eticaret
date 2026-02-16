import { ConfigProvider, App as AntdApp } from 'antd';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProductList from './pages/ProductList';
import Home from './pages/Home';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import AdminLayout from './layouts/AdminLayout';
import ProductManagement from './pages/admin/ProductManagement'; // Import
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement'; // Updated Import
import DriverPanel from './pages/driver/DriverPanel'; // Import
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';

const ConsumerLayout = () => (
  <div className="app-container">
    <div className="content-container">
      <Header />
      <Outlet />
    </div>
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
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
              </Route>

              {/* Driver Route */}
              <Route path="/driver" element={<DriverPanel />} />

              {/* Auth Route */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;