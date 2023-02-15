import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './routes/login';
import { Orders } from './routes/orders';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}
