from typing import List
from mongoengine import Document, StringField, ListField, ReferenceField
from pydantic import BaseModel
from app.models.subtopic_content_model import Subtopic_content
from app.models.subtopic_model import Subtopic as SubtopicDoc
from app.models.week_model import Week as WeekDoc
from app.models.course_model import Course
from app.models.user_model import User
from app.models.roadmap import RoadmapResponse
from app.models.user_model import User
from app.models.subtopic_content_model import Subtopic_content



# from app.models.roadmap import RoadmapResponse




def insert_roadmap_to_db(user_doc: User, roadmap: RoadmapResponse,course_name: str):
    """
    Insert a generated roadmap (list of weeks and subtopics) into MongoDB for a given user.
    
    This function will:
      1. Create a Course document for the user.
      2. For each Week in the roadmap:
         a. Create a Week document that refers to the Course.
         b. Create a Subtopic_content document (storing the subtopic description).
         c. Create a Subtopic document that references the Subtopic_content.
      3. Append the newly created Course's ID to user_doc.course_list and save the user.

    NOTE: 
    - We derive the course_name from the first week's topic. If you want a different name
      (e.g., passed in separately), replace the logic around `course_name = ...` below.
    - We store each subtopic's description into a Subtopic_content entry so that Subtopic.content
      (a ReferenceField) is satisfied.
    """

    # 1. Create the Course document
    #    - userID: string form of the MongoDB ObjectId of the user
    #    - course_name: derived from the first week's topic (adjust if you have a separate course title)
    #    - week_count: total number of weeks, stored as a string (because Course.week_count is a StringField)
    #    - week_list: a list of the topic name for each week
    week_count = len(roadmap.response)
    week_list: List[str] = [week.topic for week in roadmap.response]

    # Derive a course_name. Here, we take the first week's topic. Adjust as needed.
    # course_name = (
    #     roadmap.response[0].topic
    #     if roadmap.response and roadmap.response[0].topic
    #     else f"Course_{user_doc.id}"
    # )

    course = Course(
        userID=str(user_doc.id),
        course_name=course_name,
        week_count=str(week_count),
        week_list=week_list
    )
    course.save()

    # 2. Update the user to include this course in their course_list
    user_doc.course_list.append(str(course.id))
    user_doc.save()

    # 3. Iterate over each Week in the roadmap and create Week/Subtopic entries
    for week in roadmap.response:
        # Create a Week document for this week
        week_doc = WeekDoc(
            courseID=str(course.id),
            week_number=week.num,
            subtopic_list=[sub.subtopic for sub in week.subtopics]
        )
        week_doc.save()

        # For each Subtopic in this week, create a Subtopic_content then a Subtopic
        for sub in week.subtopics:
            # 3a. Create a Subtopic_content document to satisfy the ReferenceField
            #     - subtopicID: you could use a composite of week.num + sub.subtopic, or generate a UUID
            #     - content: we store the description here
            subtopic_content = Subtopic_content(
                subtopicID=f"week{week.num}_{sub.subtopic}",
                content=sub.description or "",
                # youtube_links, article_links, context remain default (empty) unless you want to populate them now
            )
            subtopic_content.save()

            # 3b. Create a Subtopic document that references the above content
            subtopic_doc = SubtopicDoc(
                weekID=str(week_doc.id),
                subTopic_name=sub.subtopic,
                subTopic_description=sub.description,
                is_completed=False,
                week_number=week.num,
                quiz_score=0.0,
                content=subtopic_content  # ReferenceField to Subtopic_content
            )
            subtopic_doc.save()

    # Optionally, return the newly created Course ID (or the Course object) if the caller needs it
    return course.id