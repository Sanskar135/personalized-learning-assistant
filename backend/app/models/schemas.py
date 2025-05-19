from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    token: str

class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"
