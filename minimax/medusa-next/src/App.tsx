import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AccountPage } from './pages/AccountPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:handle" element={<ProductDetailPage />} />
            <Route path="collections/:handle" element={<ProductsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/orders" element={<AccountPage />} />
            <Route path="account/profile" element={<AccountPage />} />
            <Route path="account/addresses" element={<AccountPage />} />
            <Route path="wishlist" element={<ProductsPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
