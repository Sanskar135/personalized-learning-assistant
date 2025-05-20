import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './roadmap.css'; // Import the CSS file

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subtopicContent, setSubtopicContent] = useState({});
  const [loadingSubtopic, setLoadingSubtopic] = useState(null);
  const [errorSubtopic, setErrorSubtopic] = useState(null);

  useEffect(() => {
    const topic = localStorage.getItem("selectedTopic");
    const knowledgeLevel = parseInt(localStorage.getItem("knowledgeLevel")) || 1;
    const weeks = parseInt(localStorage.getItem("weeks")) || 4;
    const hours = parseInt(localStorage.getItem("hours")) || 10;

    console.log("here");
    console.log(topic, knowledgeLevel, weeks, hours);

    const requestBody = {
      topic,
      knowledge_level: knowledgeLevel,
      weeks,
      hours,
      known_subtopics: [], // optionally populate if needed
    };

    axios.post("http://localhost:8000/roadmap/generate", requestBody, {
      headers: {
        // Authorization: `Bearer ${token}`,  // 🔐 Only if JWT required
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setRoadmap(response.data.response);
      setLoading(false);
    })
    .catch(error => {
      console.error("Failed to generate roadmap:", error.response?.data || error.message);
      setLoading(false);
    });
  }, []);

  const toggleDropdown = (index) => {
    setExpanded(prev => prev === index ? null : index);
    setSubtopicContent({});
    setErrorSubtopic(null);
    setLoadingSubtopic(null);
  };

  const fetchSubtopicContent = (topicId, subtopicId) => {
    setLoadingSubtopic(subtopicId);
    setErrorSubtopic(null);

    axios.get(`http://localhost:8000/roadmap/content/${topicId}/${subtopicId}`)
      .then(response => {
        setSubtopicContent(prev => ({
          ...prev,
          [subtopicId]: response.data,
        }));
        setLoadingSubtopic(null);
      })
      .catch(error => {
        console.error("Failed to fetch content:", error);
        setErrorSubtopic(subtopicId);
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