import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateBatch from './pages/CreateBatch';
import EventDetail from './pages/EventDetail';
import MarketUpdates from './pages/MarketUpdates';
import CreateMarketUpdate from './pages/CreateMarketUpdate';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/batch/create" element={<CreateBatch />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/market-updates" element={<MarketUpdates />} />
          <Route path="/market-updates/create" element={<CreateMarketUpdate />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
