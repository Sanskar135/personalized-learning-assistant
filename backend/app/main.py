from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.roadmap import router as roadmap_router
from app.models.user_model import User
from mongoengine import connect
# mongodb://localhost:27017/

connect(
        db='User',          # name of your MongoDB database
        host='localhost',          # or your MongoDB URI
        port=27017,  # default MongoDB port
    )

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roadmap_router)
@app.get("/")
def read_root():
    return {"message": "Backend is running!"}