import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import CreateForm from './components/CreateForm';
import ViewPage from './components/ViewPage';
import { URLShortener } from './utils/urlShortener';
import './App.css';

// Component to handle short URL redirects
const ShortUrlRedirect: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  
  if (shortId) {
    const resolvedUrl = URLShortener.resolveShortUrl(shortId);
    if (resolvedUrl) {
      return <Navigate to={resolvedUrl} replace />;
    }
  }
  
  // If short URL not found, redirect to home
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
        <Routes>
          <Route path="/" element={<CreateForm />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/s/:shortId" element={<ShortUrlRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;