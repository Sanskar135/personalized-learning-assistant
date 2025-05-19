from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.initialQuiz import router as quiz_router

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_router)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}