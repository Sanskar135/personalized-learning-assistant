import React from 'react';
import Roadmap from './pages/roadmap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;