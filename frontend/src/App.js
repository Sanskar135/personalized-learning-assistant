import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import TopicPage from './pages/input/topicPage';
import OriginalLevelPage from './pages/input/originalLevelPage';
import InitialQuizPage from './pages/input/initialQuizPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<TopicPage />} />
          <Route path="/original-level" element={<OriginalLevelPage />} />
          <Route path="/initial-quiz" element={<InitialQuizPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;