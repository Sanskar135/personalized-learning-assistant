import json
from fastapi import APIRouter, Depends, HTTPException
from ..models.ContentRequest import ContentRequest
from ..models.user_model import User
from ..utils.auth_utils import get_current_user
from ..models.course_model import Course
from ..models.week_model import Week
from ..models.subtopic_model import Subtopic
from ..models.subtopic_content_model import Subtopic_content
import google.generativeai as genai
import requests
import os
from dotenv import load_dotenv
from typing import List, Dict
import urllib.parse




load_dotenv()



def view_links(request: ContentRequest, current_user: User):
    try:
        subtopic = Subtopic.objects.get(id=request.subtopicId)
        subtopic_content = subtopic.content
        return {
            "youtube_links": subtopic_content.youtube_links,
            "article_links": subtopic_content.article_links
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def generate_links(course_name:str , week_name:str , subtopic_name:str):
    try:
            # Configure Gemini
            GEMINI_API_KEY = os.getenv("GENAI_API_KEY")
            TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            print(TAVILY_API_KEY)
            # Generate search query using Gemini
            search_prompt = f"""
            Create a specific search query to find educational video tutorials and articles about:
            Course: {course_name}
            Week Topic: {week_name}
            Specific Subtopic: {subtopic_name}

            Return only the search query text, nothing else.
            """
            print("h1")
            search_query = model.generate_content(search_prompt).text.strip()
            print("h2")
            # print(search_query)
            # Use Tavily API
            headers = {"Authorization": f"Bearer {TAVILY_API_KEY}"}
            payload = {
                "query": search_query,
                "include_answers": True,
                "search_depth": "advanced"
            }
            print("h3")
            response = requests.post(
                "https://api.tavily.com/search",
                headers=headers,
                json=payload
            )
            results = response.json().get("results", [])
            print("h4")
            # Prepare two lists
            youtube_links = []
            article_links = []

            for item in results:
                url = item.get("url", "")
                if not url:
                    continue

                # Parse the URL’s domain
                parsed = urllib.parse.urlparse(url)
                domain = parsed.netloc.lower()

                # Check for YouTube domains (you can extend this if needed)
                if "youtube.com" in domain or "youtu.be" in domain:
                    continue
                    # youtube_links.append(url)
                else:
                    article_links.append(url)
            print("h5")
            YT_API_KEY = os.getenv("YOUTUBE_API_KEY")
            youtube_search_url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": search_query,      # your text query
                "type": "video",        # only return videos, not channels or playlists
                "maxResults": 4,       # adjust as needed (max is 50 per request)
                "key": YT_API_KEY
            }
            print("h6")
            print(YT_API_KEY)
            # 3) Call the YouTube Data API
            response = requests.get(youtube_search_url, params=params)
            if response.status_code != 200:
                print("youtube api error", response.status_code, response.text)
                raise HTTPException(
                    status_code=500,
                    detail=f"YouTube API error: {response.status_code} – {response.text}"
                )
            print("h7")
            data = response.json()
            print("h8") 
            # 4) Parse out each video’s ID and build a full watch URL
            youtube_links = []
            for item in data.get("items", []):
                vid_id = item["id"].get("videoId")
                if vid_id:
                    full_url = f"https://www.youtube.com/watch?v={vid_id}"
                    youtube_links.append(full_url)

            return {
                "status": "success",
                "youtube_links": youtube_links,
                "article_links": article_links
            }
            # return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))