import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './context/UserContext';
import TopicPage from './pages/input/topicPage';
import OriginalLevelPage from './pages/input/originalLevelPage';
import InitialQuizPage from './pages/input/initialQuizPage';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <TopicPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/original-level"
          element={
            <ProtectedRoute>
              <OriginalLevelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/initial-quiz"
          element={
            <ProtectedRoute>
              <InitialQuizPage />
            </ProtectedRoute>
          }
        />         
      </Routes>
    </Router>
</UserProvider>
  );
}

export default App;
