import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './initialQuizPage.css';
// axios
import axios from 'axios';

function InitialQuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUserScore } = useUser();

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      console.log("fetching quiz")
      const topic = localStorage.getItem('selectedTopic');
      const difficulty = parseInt(localStorage.getItem('difficultyLevel')) || 1;
      
      const response = await axios.post('http://localhost:8000/quiz/generate?topic=' + topic + '&difficulty=' + difficulty);
      console.log("done fetching quiz")
      setQuiz(response.data);
      setLoading(false);
      console.log(quiz)
    } catch (err) {
      console.log("Error fetching quiz:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answerIndex) {
        score++;
      }
    });
    //console.log("score: ", score);
    return score;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const score = calculateScore();
    console.log("score: ", score);  
    // formData is not defined
    const level = parseInt(localStorage.getItem('knowledgeLevel'));
    let knowledgeLevel = 1;
    if (level === 1) {
      knowledgeLevel = score < 5 ? 2 : 3;
    } else if (level === 2) {
      knowledgeLevel = score < 5 ? 4 : 5;
    } else if (level === 3) {
      knowledgeLevel = score < 5 ? 6 : 7;
    }
    // setUserScore(score);
    localStorage.setItem('knowledgeLevel', knowledgeLevel);
    // navigate to roadmap page
    navigate('/roadmap');
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!quiz) return <div className="error">No quiz available</div>;

  return (
    <div className="quiz-container">
      <h1>Initial Assessment Quiz</h1>
      <form onSubmit={handleSubmit} className="quiz-form">
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="question-container">
            <p>Q{qIndex + 1}. {question.question}</p>
            <div className="options-container">
              {question.options.map((optionText, optIndex) => (
                <label key={optIndex} className="option-label">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={optIndex}
                    checked={answers[qIndex] === optIndex}
                    onChange={() => handleAnswerChange(qIndex, optIndex)}
                    required
                  />
                  <span className="option-text">{optionText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="submit-button">
          Submit Quiz
        </button>
      </form>
    </div>
  );
  
}

export default InitialQuizPage; 