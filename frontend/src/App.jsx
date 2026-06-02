import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Router container that resolves browser URL paths to components */}
        <Routes>
          {/* Default redirect: any user visiting '/' is navigated to '/login' */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login view */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
