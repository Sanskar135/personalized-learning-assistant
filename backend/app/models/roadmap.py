from pydantic import BaseModel
from typing import Dict, List

class Subtopic(BaseModel):
    subtopic: str
    time: str
    description: str

class Week(BaseModel):
    topic: str
    num :int
    subtopics: List[Subtopic]

class RoadmapResponse(BaseModel):
    response: List[Week]  

class ChatRequest(BaseModel):
    topic: str
    knowledge_level: int
    weeks: int
    hours: int
    known_subtopics: List[str] = []