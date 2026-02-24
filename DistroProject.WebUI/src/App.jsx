import { ConfigProvider, App as AntdApp } from 'antd';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';
import ProductManagement from './pages/admin/ProductManagement'; // Import
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement'; // Updated Import
import DriverManagement from './pages/admin/DriverManagement';
import DriverPanel from './pages/driver/DriverPanel'; // Import
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import MyAccount from './pages/MyAccount';

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
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/account" element={<MyAccount />} />
              </Route>

              {/* Driver Routes */}
              <Route path="/driver" element={<DriverLayout />}>
                <Route index element={<DriverPanel />} />
              </Route>

              {/* Auth Route */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="drivers" element={<DriverManagement />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;