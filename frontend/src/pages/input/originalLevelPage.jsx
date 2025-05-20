import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './originalLevelPage.css';

function OriginalLevelPage() {
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
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'expert': return 3;
      default: return 1;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store all form data in localStorage
    localStorage.setItem('weeks', formData.weeks);
    localStorage.setItem('hours', formData.hoursPerWeek);
    localStorage.setItem('knowledgeLevel', getDifficultyLevel(formData.knowledgeLevel));

    if (formData.knowledgeLevel !== 'absolute beginner') {
      navigate('/initial-quiz');
    } else {
      navigate('/roadmap');
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