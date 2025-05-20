from mongoengine import Document, StringField, ListField

class Subtopic_content(Document):
    subtopicID = StringField(required=True, trim=True)  # subtopic ID
    content = StringField(required=True, trim=True)  # content of the subtopic
    youtube_links = ListField(StringField(), default=list)  # youtube links of the subtopic
    article_links = ListField(StringField(), default=list)  # article links of the subtopic
    context = StringField(default=None)  # context of the subtopic for AI chatbot

    meta = {
        'collection': 'subtopic_content',
        'timestamps': True
    }
