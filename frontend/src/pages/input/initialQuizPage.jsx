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
    level = getDifficultyLevel(formData.knowledgeLevel);
    if(level == 1){
      if(score < 5){
        setUserScore(2);
      }
      else setUserScore(3);
    }
    else if(level == 2){
      if(score < 5){
        setUserScore(4);
      }
      else setUserScore(5);
    }
    else if(level == 3){
      if(score < 5){
        setUserScore(6);
      }
      else setUserScore(7);
    }
    // setUserScore(score);
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