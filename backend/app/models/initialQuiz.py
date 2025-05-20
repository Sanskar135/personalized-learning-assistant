from pydantic import BaseModel
from typing import List

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answerIndex: int
    reason: str

class Quiz(BaseModel):
    questions: List[QuizQuestion]