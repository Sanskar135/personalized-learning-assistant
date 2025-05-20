from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.roadmap import router as roadmap_router
from app.models.user_model import User
from app.routes.initialQuiz import router as quiz_router
from app.routes.auth import router as auth_router
import app.utils.database

app = FastAPI()
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(roadmap_router)
app.include_router(quiz_router)

@app.get("/")
def root():
    return {"message": "Backend running"}
