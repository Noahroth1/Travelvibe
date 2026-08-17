from typing import Annotated

from clerk_backend_api import AuthenticateRequestOptions, authenticate_request
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings


http_bearer = HTTPBearer(auto_error=False)


def require_user_id(
    request: Request,
    _credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(http_bearer),
    ] = None,
) -> str:
    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    request_state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=settings.clerk_secret_key,
            jwt_key=settings.clerk_jwt_key,
            authorized_parties=settings.clerk_authorized_party_list,
            accepts_token=["session_token"],
        ),
    )

    if not request_state.is_signed_in or not request_state.payload:
        reason = request_state.reason.name if request_state.reason else "unauthorized"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=reason,
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = request_state.payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid_user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
