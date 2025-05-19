from fastapi import APIRouter, HTTPException
from ..models.roadmap import ChatRequest
from ..services.roadmap import generate_roadmap

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.post("/generate")
async def chat(request: ChatRequest):
    try:
        response = generate_roadmap(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@router.get("/")
async def root():
    return {"message": "Gemini Chat API is running"}