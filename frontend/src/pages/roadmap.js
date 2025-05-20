import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// ... previous imports
import './roadmap.css';

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subtopicContent, setSubtopicContent] = useState({});
  const [loadingSubtopic, setLoadingSubtopic] = useState(null);
  const [errorSubtopic, setErrorSubtopic] = useState(null);
  const [visibleContent, setVisibleContent] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate('/login');

    const topic = localStorage.getItem("selectedTopic");
    const knowledgeLevel = parseInt(localStorage.getItem("knowledgeLevel")) || 1;
    const weeks = parseInt(localStorage.getItem("weeks")) || 4;
    const hours = parseInt(localStorage.getItem("hours")) || 10;

    if (!topic) {
      setError("Please select a topic");
      setLoading(false);
      return;
    }

    axios.post("http://127.0.0.1:8000/roadmap/generate", {
      topic,
      knowledge_level: knowledgeLevel,
      weeks,
      hours,
      known_subtopics: [],
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
      .then((res) => {
        setRoadmap(res.data.response);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 401 || error.response?.data?.detail === "User not found") {
          localStorage.removeItem("token");
          navigate('/login');
        } else {
          setError(error.response?.data?.detail || "Failed to generate roadmap");
        }
        setLoading(false);
      });
  }, [navigate]);

  const toggleDropdown = (index) => {
    setExpanded(prev => prev === index ? null : index);
  };

  const toggleContentVisibility = (subtopicId, week, subtopic) => {
    setVisibleContent(prev => {
      const isVisible = prev[subtopicId];
      if (!isVisible && !subtopicContent[subtopicId]) {
        fetchSubtopicContent(week, subtopic, subtopicId);
      }
      return { ...prev, [subtopicId]: !isVisible };
    });
  };

  const fetchSubtopicContent = (week_name, subtopic_name, subtopic_id) => {
    const token = localStorage.getItem("token");
    const topic = localStorage.getItem("selectedTopic");

    if (!token) return navigate('/login');

    setLoadingSubtopic(subtopic_id);
    setErrorSubtopic(null);

    axios.post(
      `http://localhost:8000/roadmap/generate/links?course_name=${topic}&week_name=${week_name}&subtopic_name=${subtopic_name}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    )
      .then(response => {
        setSubtopicContent(prev => ({
          ...prev,
          [subtopic_id]: response.data,
        }));
        setLoadingSubtopic(null);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
        } else {
          setErrorSubtopic(subtopic_id);
        }
        setLoadingSubtopic(null);
      });
  };

  if (loading) {
    return <div className="loading-text">Generating your personalized roadmap...</div>;
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
          <button onClick={() => toggleDropdown(index)} className="card-header">
            <span className="card-title">{week.topic}</span>
            <span className="toggle-icon">{expanded === index ? '▲' : '▼'}</span>
          </button>

          {expanded === index && (
            <div className="card-body">
              {week.subtopics.map((sub, subIndex) => {
                const subId = `${week.topic}-${subIndex}`;
                const content = subtopicContent[subId];

                return (
                  <div key={subIndex} className="subtopic-card">
                    <h3>{sub.subtopic}</h3>
                    <p>⏱ {sub.time}</p>
                    <p>{sub.description}</p>

                    <button
                      onClick={() => toggleContentVisibility(subId, week.topic, sub.subtopic)}
                      className="view-content-btn"
                    >
                      {loadingSubtopic === subId
                        ? "Loading..."
                        : visibleContent[subId]
                          ? "🔽 Hide Content"
                          : "📘 View Content"}
                    </button>

                    {errorSubtopic === subId && (
                      <p className="error-message">⚠ Failed to load content.</p>
                    )}

                    {visibleContent[subId] && content && (
                      <div className="subtopic-content">
                        {content.youtube_links?.length > 0 && (
                          <>
                            <h4>🎥 YouTube Videos</h4>
                            <ul>
                              {content.youtube_links.map((link, idx) => (
                                <li key={idx}>
                                  <a href={link} target="_blank" rel="noopener noreferrer">
                                    Video {idx + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {content.article_links?.length > 0 && (
                          <>
                            <h4>📰 Articles</h4>
                            <ul>
                              {content.article_links.map((link, idx) => (
                                <li key={idx}>
                                  <a href={link} target="_blank" rel="noopener noreferrer">
                                    Article {idx + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </>
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