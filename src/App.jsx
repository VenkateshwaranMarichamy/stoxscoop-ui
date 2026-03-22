import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateBatch from './pages/CreateBatch';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/batch/create" element={<CreateBatch />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
