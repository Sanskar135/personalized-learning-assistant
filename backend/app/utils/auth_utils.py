
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from mongoengine.errors import DoesNotExist
from ..middlewares.dependency import verify_token
from dotenv import load_dotenv
from typing import Optional

# Import your MongoEngine User Document
from ..models.user_model import User

def get_current_user(payload: Dict[str, Any] = Depends(verify_token)):
    
    # print(payload.get(sub))
    # Extract subject (email) from payload
    user_email: Optional[str] = payload.get("sub")
    if user_email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_obj: User = User.objects.get(email=user_email)
        # print(user_obj.email)
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_obj