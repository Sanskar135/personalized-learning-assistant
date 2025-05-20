from mongoengine import Document, StringField, BooleanField, DateTimeField, IntField, FloatField, ReferenceField

class Subtopic(Document):
    weekID = StringField(required=True, trim=True)  # week ID
    subTopic_name = StringField(required=True, trim=True)  # subtopic name
    subTopic_description = StringField(required=True, trim=True)  # subtopic description
    is_completed = BooleanField(default=False)  # subtopic completion status
    completion_time = DateTimeField(default=None)  # subtopic completion time
    week_number = IntField(required=True, trim=True)  # week number
    quiz_score = FloatField(default=0)  # quiz score
    content = ReferenceField('Subtopic_content', required=True)  # stores the content of the subtopic

    meta = {
        'collection': 'subtopic',
        'timestamps': True
    }
