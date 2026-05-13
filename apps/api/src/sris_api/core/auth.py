from dataclasses import dataclass

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sris_api.core.config import Settings, get_settings

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    sub: str
    email: str


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if settings.disable_auth:
        return CurrentUser(sub="dev-user", email=settings.allowed_user_email or "dev@example.com")

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    if not settings.supabase_jwt_secret:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="JWT secret not set")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    email = payload.get("email")
    subject = payload.get("sub")
    if not email or not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")

    allowed = settings.allowed_user_email.strip().lower()
    if allowed and email.lower() != allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not allowed")

    return CurrentUser(sub=subject, email=email)


async def verify_cron_secret(
    x_cron_secret: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    if not x_cron_secret or x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cron secret")
