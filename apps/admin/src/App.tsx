import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '2rem' }}>
        <h1>ttPin Admin Panel</h1>
        <nav style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>Dashboard</Link>
          <Link to="/users">Users</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function Dashboard() {
  return <h2>Dashboard - Coming Soon</h2>;
}

function Users() {
  return <h2>User Management - Coming Soon</h2>;
}

export default App;
