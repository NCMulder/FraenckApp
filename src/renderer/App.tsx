import React from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import './App.css';
import Login from './routes/login';
import { orderLoader, OrderPage, Orders } from './routes/orders';

export default function App() {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/orders',
      element: <Orders />,
    },
    {
      path: '/orders/:orderId',
      loader: orderLoader,
      element: <OrderPage />,
    },
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderid" element={<OrderPage />} />
      </Routes>
    </Router>
  );
}
