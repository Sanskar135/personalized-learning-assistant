from mongoengine import (
    Document, StringField, EmailField, BooleanField,
    ListField, ReferenceField, IntField, DateTimeField, DictField
)
from datetime import datetime

# SubTopic Content Model
class SubTopicContent(Document):
    content = StringField()
    youtube_links = ListField(StringField())
    blog_links = ListField(StringField())
    chatbot_context = StringField()

    meta = {'collection': 'subtopic_content'}

# SubTopic Model
class SubTopic(Document):
    week = ReferenceField('Week', required=True)
    name = StringField(required=True)
    description = StringField()
    content_ref = ReferenceField(SubTopicContent)
    is_completed = BooleanField(default=False)
    time_of_completion = DateTimeField()
    week_number = IntField()
    quiz_score = IntField()

    meta = {'collection': 'subtopics'}

# Week Model
class Week(Document):
    course = ReferenceField('Course', required=True)
    week_number = IntField(required=True)
    subtopics = ListField(ReferenceField(SubTopic))

    meta = {'collection': 'weeks'}

# Course Model
class Course(Document):
    user = ReferenceField('User', required=True)
    course_id = StringField(required=True)
    topic = StringField()
    number_of_weeks = IntField()
    weeks = ListField(ReferenceField(Week))

    meta = {'collection': 'courses'}

# User Model
class User(Document):
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    email = EmailField(required=True, unique=True)
    last_logged_in = DateTimeField(default=datetime.utcnow)
    password = StringField(required=True)
    courses = ListField(ReferenceField(Course))

    meta = {'collection': 'users'}

