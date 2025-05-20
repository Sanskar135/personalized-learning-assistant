import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './roadmap.css'; // Import the CSS file

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subtopicContent, setSubtopicContent] = useState({});
  const [loadingSubtopic, setLoadingSubtopic] = useState(null);
  const [errorSubtopic, setErrorSubtopic] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  
  // Redirect to login if no token
  if (!token) {
    navigate('/login');
    return;
  }

  // Validate token format and decode payload
  let userId;
  try {
    const payload = jwtDecode(token); // Decode token without secret key
    userId = payload.sub; // Assuming 'sub' contains the user ID
    console.log("User ID from token:", userId); // Debug user ID
  } catch (error) {
    console.error("Invalid token:", error.message);
    localStorage.removeItem("token"); // Clear invalid token
    navigate('/login');
    return;
  }

  // Retrieve and validate data from localStorage
  const topic = localStorage.getItem("selectedTopic");
  const knowledgeLevel = parseInt(localStorage.getItem("knowledgeLevel")) || 1;
  const weeks = parseInt(localStorage.getItem("weeks")) || 4;
  const hours = parseInt(localStorage.getItem("hours")) || 10;

  // Validate request body
  if (!topic) {
    console.error("Missing topic in localStorage");
    setError("Please select a topic");
    setLoading(false);
    return;
  }

  const requestBody = {
    topic,
    knowledge_level: knowledgeLevel,
    weeks,
    hours,
    known_subtopics: [], // Populate if needed
  };

  // Make API request
  axios
    .post("http://127.0.0.1:8000/roadmap/generate", requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      setRoadmap(response.data.response);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Failed to generate roadmap:", error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.data?.detail === "User not found") {
        localStorage.removeItem("token"); // Clear invalid token
        navigate('/login');
      } else {
        setError(error.response?.data?.detail || "Failed to generate roadmap");
      }
      setLoading(false);
    });
}, [navigate]);

const toggleDropdown = (index) => {
  setExpanded((prev) => (prev === index ? null : index));
  setSubtopicContent({});
  setErrorSubtopic(null);
  setLoadingSubtopic(null);
};

  const fetchSubtopicContent = (topicId, subtopicId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    setLoadingSubtopic(subtopicId);
    setErrorSubtopic(null);

    axios.get(`http://localhost:8000/roadmap/content/${topicId}/${subtopicId}`, {
      headers: {
        Authorization: `Bearer ${token}` // Add the token to the request
      }
    })
      .then(response => {
        setSubtopicContent(prev => ({
          ...prev,
          [subtopicId]: response.data,
        }));
        setLoadingSubtopic(null);
      })
      .catch(error => {
        console.error("Failed to fetch content:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
        } else {
          setErrorSubtopic(subtopicId);
        }
        setLoadingSubtopic(null);
      });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Generating your personalized roadmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className="retry-button">
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="roadmap-container">
      <h1 className="roadmap-title">🚀 Learning Roadmap</h1>

      {roadmap.map((week, index) => (
        <div key={index} className="roadmap-card">
          <button
            onClick={() => toggleDropdown(index)}
            className="card-header"
          >
            <span className="card-title">
              Week {week.num}: {week.topic}
            </span>
            <span className="toggle-icon">{expanded === index ? '▲' : '▼'}</span>
          </button>

          {expanded === index && (
            <div className="card-body">
              {week.subtopics.map((sub, subIndex) => {
                const subId = `${week.num}-${subIndex}`;
                const content = subtopicContent[subId];

                return (
                  <div key={subIndex} className="subtopic-card">
                    <h3 className="subtopic-title">{sub.subtopic}</h3>
                    <p className="subtopic-time">⏱️ Estimated Time: {sub.time}</p>
                    <p className="subtopic-desc">{sub.description}</p>

                    <button
                      onClick={() => fetchSubtopicContent(week.id || week.num, sub.id || subIndex)}
                      className="view-content-btn"
                    >
                      {loadingSubtopic === sub.id || loadingSubtopic === subIndex ? "Loading..." : "📘 View Content"}
                    </button>

                    {errorSubtopic === sub.id || errorSubtopic === subIndex ? (
                      <p className="error-message">⚠️ Failed to load content.</p>
                    ) : content && (
                      <div className="subtopic-content">
                        {content.text && <p>{content.text}</p>}
                        {content.videoUrl && (
                          <video controls className="subtopic-video">
                            <source src={content.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Roadmap;