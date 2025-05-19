import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import './topicPage.css';

function TopicPage() {
  const [topic, setTopic] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('selectedTopic', topic);
    navigate('/original-level');
  };

  return (
    <div className="topic-container">
      <h1>What do you want to learn?</h1>
      <form onSubmit={handleSubmit} className="topic-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter a topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="topic-input"
            required
          />
          <button type="submit" className="search-button">
            {topic ? <FaArrowRight /> : <FaSearch />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TopicPage; 