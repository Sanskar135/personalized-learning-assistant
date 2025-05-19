import os
import google.generativeai as genai
from pydantic import ValidationError
from ..models.roadmap import ChatRequest, RoadmapResponse 
import json
from typing import Dict
from dotenv import load_dotenv

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
            
        )
    )

def generate_roadmap(request: ChatRequest):
    api_key=os.getenv("GENAI_API_KEY")
    # print(f"API Key: {api_key}")
    model = configure_gemini(api_key)
    try:
        if len(request.known_subtopics)==0:
            # print("No known subtopics provided.")
            prompt = (
                f"Create a learning roadmap for {request.topic} tailored for a {request.knowledge_level} learner. "
                f"The roadmap should span {request.weeks} weeks with a total of {request.hours} hours per week."
            )
        else:
            known_subtopics_str = ", ".join(request.known_subtopics)
            prompt = (
                f"Create a learning roadmap for {request.topic} tailored for a {request.knowledge_level} learner. on a scale of 1-7 "
                f"The roadmap should span {request.weeks} weeks with a total of {request.hours} hours per week. "
                f"Distribute the hours evenly across weeks and provide subtopics with descriptions and time estimates. "
                f"Ensure the roadmap is relevant to {request.topic} and suitable for the specified knowledge level. "
                f"Exclude the following subtopics that the user already knows: {known_subtopics_str}."
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
        return roadmap
    except json.JSONDecodeError:
        raise ValueError("Failed to parse Gemini response as JSON")
    except ValidationError as e:
        raise ValueError(f"Response validation failed: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error generating roadmap: {str(e)}")