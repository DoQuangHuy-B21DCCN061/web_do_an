import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UIMainPage from './pages/UIMainPage';
import UILogin from './pages/UILogin';
import UIStatistic from './pages/UIStatistic';
import AdminLayout from './components/AdminLayout';
import UISupplierManage from './pages/UISupplierManage';
import SupplierDetailPage from './pages/SupplierDetailPage';
import UIProductManage from './pages/UIProductManage';
import UIImportProduct from './pages/UIImportProduct';
import UIImportHistory from './pages/UIImportHistory';
import UICustomerManage from './pages/UICustomerManage';
import UICategoryManage from './pages/UICategoryManage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import UIReviewManage from './pages/UIReviewManage';
import UIReviewDetail from './pages/UIReviewDetail';
import UIOrderManage from './pages/UIOrderManage';
import OrderDetailPage from './pages/OrderDetailPage';

// Import các thành phần cho luồng Khách hàng
import CustomerLayout from './components/CustomerLayout';
import UIPersonalInfo from './pages/UIPersonalInfo';
import UIPersonalOrder from './pages/UIPersonalOrder'; // BƯỚC 8, 9: Import trang Quản lý đơn hàng cá nhân
import UIPersonalReview from './pages/UIPersonalReview';
import UIPersonalAccountSetting from './pages/UIPersonalAccountSetting';
import UISearchPage from './pages/UISearchPage';
import UICart from './pages/UICart';
import UIProductPage from './pages/UIProductPage';
import UICheckout from './pages/UICheckout';
import UIVNpayCheckout from './pages/UIVNpayCheckout';
function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Trang chủ và Đăng nhập (Bước 1, 2) */}
        <Route path="/" element={<UIMainPage />} />
        <Route path="/login" element={<UILogin />} />
        <Route path="/search" element={<UISearchPage />} />
        <Route path="/cart" element={<UICart />} />
        <Route path="/product/:id" element={<UIProductPage />} />
        <Route path="/checkout" element={<UICheckout />} />
        <Route path="/checkout/vnpay" element={<UIVNpayCheckout />} />

        {/* 2. Luồng Khách hàng (Customer Flow) */}
        <Route path="/customer" element={<CustomerLayout />}>
          {/* Mặc định hiện Hồ sơ cá nhân (Bước 5) */}
          <Route index element={<UIPersonalInfo />} />
          <Route path="profile" element={<UIPersonalInfo />} />

          {/* Quản lý đơn hàng cá nhân (Bước 10) */}
          <Route path="orders" element={<UIPersonalOrder />} />

          {/* Các tính năng khác (có thể mở rộng sau) */}
          <Route path="reviews" element={<UIPersonalReview />} />
          <Route path="settings" element={<UIPersonalAccountSetting />} />
        </Route>

        {/* 3. Luồng Quản trị viên (Admin Flow) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="statistic" element={<UIStatistic />} />
          <Route path="customers" element={<UICustomerManage />} />
          <Route path="products" element={<UIProductManage />} />
          <Route path="products/import" element={<UIImportProduct />} />
          <Route path="products/import/history" element={<UIImportHistory />} />
          <Route path="suppliers" element={<UISupplierManage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="categories" element={<UICategoryManage />} />
          <Route path="categories/:id" element={<CategoryDetailPage />} />
          <Route path="reviews" element={<UIReviewManage />} />
          <Route path="reviews/product/:productId" element={<UIReviewDetail />} />
          <Route path="orders" element={<UIOrderManage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;