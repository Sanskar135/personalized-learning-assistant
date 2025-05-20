from pydantic import BaseModel

class ContentRequest(BaseModel):
    courseId: str
    weekId: str
    subtopicId: str