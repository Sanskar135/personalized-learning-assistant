from mongoengine import Document, StringField, ListField

class Course(Document):
    userID = StringField(required=True, trim=True)  # user ID
    course_name = StringField(required=True, trim=True)  # course topic
    week_count = StringField(required=True, trim=True)  # number of weeks
    week_list = ListField(StringField(), required=True, trim=True)  # list of weeks

    meta = {
        'collection': 'course',
        'timestamps': True
    }

