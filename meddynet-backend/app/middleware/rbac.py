from fastapi import Request, HTTPException, status

from typing import Union, List


def require_role(required_roles: Union[str, List[str]]):
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def role_dependency(request: Request):
        user = request.state.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )

        user_role = user.get("role")
        if user_role in required_roles or user_role == "superadmin":
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required: {required_roles}",
        )

    return role_dependency


def get_current_user(request: Request):
    user = request.state.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user
