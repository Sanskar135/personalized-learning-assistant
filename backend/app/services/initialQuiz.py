import google.generativeai as genai
import json
import os
from ..models.initialQuiz import Quiz
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv('.env')
# Configure the API key (loaded from environment variable)
genai.configure(api_key=os.getenv("GENAI_API_KEY"))
def generate_quiz(topic: str, difficulty: int):
    """
    Generate a quiz with 10 questions based on the topic and difficulty level.
    Difficulty: 1 (basic), 2 (intermediate), 3 (advanced).
    """
    # Validate difficulty
    if difficulty not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Difficulty must be 1, 2, or 3")

    # Map difficulty to descriptive terms
    difficulty_map = {1: "basic", 2: "intermediate", 3: "advanced"}
    difficulty_desc = difficulty_map[difficulty]

    # Configure the generative model
    client = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 20000,
            "response_mime_type": "application/json",
        },
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ],
        system_instruction="""You are an AI agent who provides quizzes to test understanding of user on a topic. The quiz will be based on topic, subtopic and the description of subtopic which describes what exactly to learn. The questions must be Multiple Choice Questions, can include calculation if necessary. Only one option must be correct. Questions and options should not be ambiguous. Include questions that require deep thinking. Give reasoning for the answer for each question."""
    )
    # print("here")
    try:
        # Generate content
        response = client.generate_content(
            contents=f"Generate a 10-question quiz on {topic} at {difficulty_desc} difficulty level.",
            generation_config={"response_mime_type": "application/json", "response_schema": Quiz},
        )
        print(response.text)
        # Parse the response
        # return response.text
        json_text = response.text
        quiz_dict = json.loads(json_text)
        quiz = Quiz(**quiz_dict)
        return quiz
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")