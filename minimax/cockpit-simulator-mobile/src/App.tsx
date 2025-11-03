import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { CollectionPage } from './pages/CollectionPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AccountPage } from './pages/AccountPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { SoftwarePage } from './pages/SoftwarePage'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-background-primary text-neutral-50 font-primary transition-colors duration-300">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:handle" element={<ProductDetailPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collections/:handle" element={<CollectionPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/software" element={<SoftwarePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  )
}

export default App
