import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './originalLevelPage.css';

function OriginalLevelPage() {
  const { setUserScore } = useUser();
  const [formData, setFormData] = useState({
    weeks: '',
    hoursPerWeek: '',
    knowledgeLevel: 'absolute beginner'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDifficultyLevel = (knowledgeLevel) => {
    switch(knowledgeLevel) {
      case 'absolute beginner': return 0;
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'expert': return 3;
      default: return 0;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('difficultyLevel', getDifficultyLevel(formData.knowledgeLevel));
    level = getDifficultyLevel(formData.knowledgeLevel);
    if(level == 0) {
      setUserScore(1);
      // navigate to roadmap page
    }
    else {
      navigate('/initial-quiz');
    }
  };

  return (
    <div className="level-container">
      <h1>Set Your Learning Parameters</h1>
      <form onSubmit={handleSubmit} className="level-form">
        <div className="form-group">
          <label htmlFor="weeks">Number of Weeks</label>
          <input
            type="number"
            id="weeks"
            name="weeks"
            value={formData.weeks}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="hoursPerWeek">Hours per Week</label>
          <input
            type="number"
            id="hoursPerWeek"
            name="hoursPerWeek"
            value={formData.hoursPerWeek}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="knowledgeLevel">Current Knowledge Level</label>
          <select
            id="knowledgeLevel"
            name="knowledgeLevel"
            value={formData.knowledgeLevel}
            onChange={handleChange}
            required
          >
            <option value="absolute beginner">Absolute Beginner</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <button type="submit" className="generate-button">
          Generate Roadmap
        </button>
      </form>
    </div>
  );
}

export default OriginalLevelPage; 