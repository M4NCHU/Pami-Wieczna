import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import MemorialProfile from './pages/MemorialProfile';
import CreateOrder from './pages/CreateOrder';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile/:id" element={<MemorialProfile />} />
          <Route path="/create" element={<CreateOrder />} />
          {/* Redirect generic profile link to demo */}
          <Route path="/profile" element={<Navigate to="/profile/demo" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;