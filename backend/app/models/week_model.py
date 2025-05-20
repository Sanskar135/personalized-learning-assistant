from mongoengine import Document, StringField, ListField, IntField

class Week(Document):
    courseID = StringField(required=True, trim=True)  # course ID
    week_number = IntField(required=True, trim=True)  # week number
    subtopic_list = ListField(StringField(), required=True, trim=True)  # list of subtopics

    meta = {
        'collection': 'week',
        'timestamps': True
    }
