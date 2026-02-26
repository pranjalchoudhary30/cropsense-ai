from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user_model import UserCreate, UserResponse, Token, GoogleLogin, UserInDB
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from app.database import db
from datetime import datetime, timedelta
from jose import JWTError, jwt

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# List of emails allowed to use Google Sign In
ALLOWED_EMAILS = [
    "pranjalchoudhary30@gmail.com",
    "pranjalchoudhary8765@gmail.com"
]

def get_user_repository():
    return UserRepository(db.db)

def get_auth_service():
    return AuthService()

async def get_current_user(token: str = Depends(oauth2_scheme), user_repo: UserRepository = Depends(get_user_repository)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await user_repo.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    
    return UserInDB(**user)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate, 
    user_repo: UserRepository = Depends(get_user_repository),
    auth_service: AuthService = Depends(get_auth_service)
):
    # Check if user exists
    existing_user = await user_repo.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user_data.dict()
    
    if user_dict.get('password'):
        user_dict['hashed_password'] = auth_service.get_password_hash(user_dict.pop('password'))
    
    new_user = await user_repo.create_user(user_dict)
    return UserResponse(
        id=str(new_user["_id"]),
        email=new_user["email"],
        name=new_user.get("name", ""),
        created_at=new_user.get("created_at") or datetime.utcnow()
    )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: UserRepository = Depends(get_user_repository),
    auth_service: AuthService = Depends(get_auth_service)
):
    user = await user_repo.get_user_by_email(form_data.username) # OAuth2 uses `username` field for email generally
    if not user or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not auth_service.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        id=user["_id"],
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"]
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

@router.post("/google", response_model=Token)
async def google_auth(
    google_login: GoogleLogin,
    user_repo: UserRepository = Depends(get_user_repository),
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        # Verify the token
        idinfo = auth_service.verify_google_token(google_login.credential)
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        google_id = idinfo['sub']
        
        # Security Check: Only allow specified emails to login via Google
        if ALLOWED_EMAILS and email not in ALLOWED_EMAILS:
            raise ValueError("This email address is not authorized to access this platform.")
        
        # Check if user exists
        user = await user_repo.get_user_by_email(email)
        
        if not user:
            # Create a new user automatically via Google
            user_data = {
                "email": email,
                "name": name,
                "google_id": google_id
            }
            new_user = await user_repo.create_user(user_data)
            user = new_user
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_service.create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user.get("name", "Unknown"),
            created_at=user.get("created_at")
        )
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_response}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at
    )
