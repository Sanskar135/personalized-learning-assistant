import os
import google.generativeai as genai
from pydantic import ValidationError
from ..models.roadmap import ChatRequest, RoadmapResponse 
from ..models.course_model import Course
import json
from typing import Dict
from dotenv import load_dotenv
from ..utils.addRoadmapData import insert_roadmap_to_db
from ..models.subtopic_model import Subtopic
from ..models.week_model import Week
from ..models.subtopic_content_model import Subtopic_content
from ..models.user_model import User
from typing import List, Dict, Any

from mongoengine.errors import DoesNotExist


load_dotenv('.env')

def configure_gemini(api_key: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ],
        generation_config={
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "application/json",
        },
        system_instruction=(
            "You are an AI agent who provides personalized learning paths based on user input. "
            "Generate a learning roadmap with weekly plans, each containing a topic and subtopics. "
            "Each subtopic should include a name, time estimate, and description of what to learn. "
            "Distribute the learning hours evenly across the specified weeks. "
            "Ensure the roadmap is tailored to the user's knowledge level and excludes any known subtopics. "
            "Mention subtopics such that User should be able to get online reosurces of suntopics you mentioned"
            
        )
    )

def generate_roadmap(request: ChatRequest, current_user: User):
    api_key=os.getenv("GENAI_API_KEY")
    # print(f"API Key: {api_key}")
    model = configure_gemini(api_key)
    try:
        if len(request.known_subtopics)==0:
            # print("No known subtopics provided.")
            prompt = (
                f"Create a learning roadmap for {request.topic} tailored for a {request.knowledge_level} learner (on a scale of 1–7). The roadmap should span {request.weeks} weeks, with {request.hours} hours per week (distributed evenly). For each week, list subtopics along with brief descriptions and time estimates. Make sure every subtopic is self-contained and focuses on material that can be studied through common video tutorials and written guides."
            )
        else:
            known_subtopics_str = ", ".join(request.known_subtopics)
            prompt = (
                      f"Create a learning roadmap for {request.topic} tailored for a {request.knowledge_level} learner (on a scale of 1–7). The roadmap should span {request.weeks} weeks, with {request.hours} hours per week (distributed evenly). For each week, list subtopics along with brief descriptions and time estimates. Make sure every subtopic is self-contained and focuses on material that can be studied through common video tutorials and written guides. Exclude the following subtopics that the user already knows: {known_subtopics_str}."
            )
        response = model.generate_content(
            contents=prompt,
            generation_config={"response_mime_type": "application/json","response_schema": {
  "type": "object",
  "properties": {
    "response": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "num": { "type": "integer" },
          "topic": { "type": "string" },
          "subtopics": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "subtopic": { "type": "string" },
                "time": { "type": "string" },
                "description": { "type": "string" }
              },
              "required": ["subtopic", "time", "description"]
            }
          }
        },
        "required": ["num", "topic", "subtopics"]
      }
    }
  },
  "required": ["response"]
}},
        )
        json_text = response.text
        roadmap_dict = json.loads(json_text)
        roadmap = RoadmapResponse(**roadmap_dict)

        insert_roadmap_to_db(current_user, roadmap,request.topic)
        return roadmap



         
    except json.JSONDecodeError:
        raise ValueError("Failed to parse Gemini response as JSON")
    except ValidationError as e:
        raise ValueError(f"Response validation failed: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error generating roadmap: {str(e)}")
    



def getCourseList(current_user: User):
    user_id_str = str(current_user.id)
    courses = Course.objects(userID=user_id_str)

    course_list: List[Dict[str, Any]] = []

    for course in courses:
        # Build a dict for this course
        course_dict: Dict[str, Any] = {
            "course_id":   str(course.id),
            "course_name": course.course_name,
            "week_count":  course.week_count,
            "weeks":       []
        }

        # 2. For each Course, fetch all Week documents whose `courseID` matches.
        weeks = Week.objects(courseID=str(course.id))

        # If you also want to enforce ordering by week_number:
        # weeks = Week.objects(courseID=str(course.id)).order_by("week_number")

        for week in weeks:
            week_dict: Dict[str, Any] = {
                "week_id":     str(week.id),
                "week_number": week.week_number,
                "subtopics":   []
            }

            # 3. For each Week, fetch all Subtopic documents whose `weekID` matches.
            subtopics = Subtopic.objects(weekID=str(week.id))

            for sub in subtopics:
                try:
                    # 4. Follow the ReferenceField to pull in Subtopic_content
                    content_doc: Subtopic_content = sub.content
                except DoesNotExist:
                    # If for some reason the reference isn't found, skip or set to None
                    content_doc = None

                # Build a dict for this Subtopic + its nested content
                sub_dict: Dict[str, Any] = {
                    "subtopic_id":          str(sub.id),
                    "subTopic_name":        sub.subTopic_name,
                    "subTopic_description": sub.subTopic_description,
                    "is_completed":         sub.is_completed,
                    "completion_time":      sub.completion_time,
                    "quiz_score":           sub.quiz_score,
                }

                if content_doc:
                    sub_dict.update({
                        "content":       content_doc.content,
                        "youtube_links": content_doc.youtube_links,
                        "article_links": content_doc.article_links,
                        "context":       content_doc.context
                    })
                else:
                    # If no content_doc exists, you can explicitly set those keys to None/empty
                    sub_dict.update({
                        "content":       None,
                        "youtube_links": [],
                        "article_links": [],
                        "context":       None
                    })

                week_dict["subtopics"].append(sub_dict)

            course_dict["weeks"].append(week_dict)

        course_list.append(course_dict)

    return course_list