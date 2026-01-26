# Frontend Integration Guide

Guide for connecting your React frontend to the MySQL backend API.

## 📋 Overview

All hardcoded data in your React app needs to be replaced with API calls. This guide shows how to:

1. Setup API client with axios/fetch
2. Replace hardcoded data with API calls
3. Implement loading/error states
4. Handle authentication tokens

## 🔗 API Client Setup

### Create src/api/client.ts

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Update .env in root directory

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🔐 Update AuthContext

Replace your hardcoded auth logic with API calls:

```typescript
// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

interface AuthContextType {
  user: { id: number; email: string; firstName: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { userId, firstName, lastName, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser({
        id: userId,
        email,
        firstName,
        role: 'customer',
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      const { userId, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser({
        id: userId,
        email,
        firstName,
        role: 'customer',
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## 🛍️ Product Pages Integration

### Update Shop.tsx

```typescript
import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/products', {
          params: { page, limit: 12 },
        });
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={p === page ? 'btn-primary' : 'btn-outline'}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Update ProductDetail.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '@/api/client';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data.data);
        setSelectedVariant(response.data.data.variants[0]);
      } catch (error) {
        console.error('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Size Selection */}
      <div className="mt-6">
        <label>Select Size:</label>
        <select
          value={selectedVariant?.id}
          onChange={(e) => {
            const variant = product.variants.find((v: any) => v.id === parseInt(e.target.value));
            setSelectedVariant(variant);
          }}
        >
          {product.variants.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.size_ml}ml - ₹{v.discounted_price || v.price}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2>Customer Reviews</h2>
        {product.reviews.map((review: any) => (
          <div key={review.id} className="border p-4 mt-4">
            <div className="flex justify-between">
              <h3>{review.title}</h3>
              <span>⭐ {review.rating}/5</span>
            </div>
            <p>{review.review_text}</p>
            <small>By {review.first_name} {review.last_name}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🛒 Cart Integration

### Update CartContext

```typescript
import React, { createContext, useContext, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  productVariantId: number;
  productName: string;
  sizeMl: number;
  price: number;
  quantity: number;
}

const CartContext = createContext<any>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from API on auth
  React.useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      const response = await apiClient.get('/cart');
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to load cart');
    }
  };

  const addToCart = async (productVariantId: number, quantity: number) => {
    setIsLoading(true);
    try {
      await apiClient.post('/cart', { productVariantId, quantity });
      await loadCart();
    } catch (error) {
      console.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/cart/${cartItemId}`);
      await loadCart();
    } catch (error) {
      console.error('Failed to remove from cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    setIsLoading(true);
    try {
      await apiClient.put(`/cart/${cartItemId}`, { quantity });
      await loadCart();
    } catch (error) {
      console.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ items, isLoading, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
```

## 📝 Migration Checklist

- [ ] Replace hardcoded products with API calls
- [ ] Update AuthContext with API integration
- [ ] Update ProductContext with API calls
- [ ] Update CartContext with API calls
- [ ] Add loading states to all pages
- [ ] Add error handling and messages
- [ ] Update environment variables
- [ ] Test login/register flow
- [ ] Test product listing and search
- [ ] Test cart operations
- [ ] Test checkout/orders

## 🚀 Environment Variables

Add to `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
```

Production:
```env
REACT_APP_API_URL=https://api.bhatkar.com
```

## 📚 More API Endpoints

Coming soon:
- GET `/api/cart` - Get user's cart
- POST `/api/cart` - Add item to cart
- POST `/api/orders` - Create order
- GET `/api/orders` - List user's orders
- POST `/api/wishlist` - Add to wishlist
- POST `/api/reviews` - Submit review

## ✅ Testing

1. Start backend: `cd server && npm run dev`
2. Verify API: `curl http://localhost:5000/api/health`
3. Test login: `curl -X POST http://localhost:5000/api/auth/login`
4. Start frontend: `npm run dev`
5. Check browser console for API calls

## 🔧 Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in server `.env` includes your frontend URL
- Check browser console for specific CORS errors

### Token Issues
- Check localStorage for `accessToken` and `refreshToken`
- Verify JWT secret matches between frontend and backend
- Check token expiration: use `jwt.io` to decode

### Database Connection
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Check tables: `USE bhatkar_fragrance; SHOW TABLES;`

---

That's it! Your frontend is now connected to a real MySQL database.
