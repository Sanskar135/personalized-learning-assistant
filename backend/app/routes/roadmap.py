from fastapi import APIRouter, Depends, HTTPException
from ..models.roadmap import ChatRequest
from ..services.roadmap import generate_roadmap, getCourseList
from ..utils.auth_utils import get_current_user
from ..models.user_model import User


router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

# ,current_user: str = Depends(get_current_user)
@router.post("/generate")
async def chat(request: ChatRequest,current_user: User = Depends(get_current_user)):
    try:
        # print(current_user.email)	
        response = generate_roadmap(request,current_user)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
    


@router.get("/view")
async def test(current_user: User = Depends(get_current_user)):
    return getCourseList(current_user)
    

@router.get("/")
async def root():
    return {"message": "Gemini Chat API is running"}