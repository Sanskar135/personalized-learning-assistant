from fastapi import APIRouter, HTTPException
from ..models.initialQuiz import Quiz
from ..services.initialQuiz import generate_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])



@router.post("/generate", response_model=Quiz)
async def generate_quiz_endpoint(topic: str, difficulty: int):
    """
    Generate a quiz based on the given topic and difficulty level.
    Difficulty: 1 (basic), 2 (intermediate), 3 (advanced).
    """
    try:
        quiz = generate_quiz(topic, difficulty)
        # console.log("here")
        return quiz
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")