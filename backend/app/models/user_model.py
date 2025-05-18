from mongoengine import Document, StringField, EmailField, DateTimeField, ListField

class User(Document):
    firstname = StringField(required=True, trim=True)
    lastname = StringField(required=True, trim=True)
    email = EmailField(required=True, unique=True, trim=True)
    password = StringField(required=True, trim=True)
    last_login_time = DateTimeField(default=None)
    course_list = ListField(StringField(), default=list)

    meta = {
        'collection': 'user',
        'timestamps': True
    }
