
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from mongoengine.errors import DoesNotExist

# Import your MongoEngine User Document
from ..models.user_model import User

# JWT config
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"

# HTTP Bearer Auth
security = HTTPBearer()
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    FastAPI dependency that:
      1. Extracts the JWT from the Authorization header.
      2. Decodes and verifies it. Expects a "sub" claim (email).
      3. Fetches the corresponding User document from MongoDB.
      4. Raises HTTPException if anything goes wrong.

    Usage in a route:
        @app.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            return {"email": current_user.email, "firstname": current_user.firstname}
    """
    token = credentials.credentials  # the raw JWT (string)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract subject (email) from payload
    user_email: Optional[str] = payload.get("sub")
    if user_email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # return user_email
    # print(user_email)
    # Fetch user from MongoDB
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