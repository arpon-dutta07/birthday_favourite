import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import CreateForm from './components/CreateForm';
import ViewPage from './components/ViewPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
        <Routes>
          <Route path="/" element={<CreateForm />} />
          <Route path="/view" element={<ViewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;