import os
from jose import jwt, JWTError
import logging
from typing import Optional
from dataclasses import dataclass
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# --- CONFIGURAÇÃO DE SEGURANÇA SARAK (v5.5) ---
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "sarak_matrix_default_secret_key_2024")
ALGORITHM = "HS256"

@dataclass
class IdentityContext:
    user_id: str
    system: str
    email: Optional[str] = None
    role: Optional[str] = None
    is_system: bool = False

def get_current_identity(authorization: Optional[str] = Header(None)) -> IdentityContext:
    """
    Validador de Identidade Soberano (v5.5).
    Decodifica o JWT localmente sem depender do módulo de Auth-Identity em runtime.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorização não fornecido."
        )

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id = payload.get("sub")
        system = payload.get("system")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido: ID de usuário ausente.")
        if not system:
            raise HTTPException(status_code=401, detail="Token inválido: Contexto de sistema ausente.")

        return IdentityContext(
            user_id=user_id,
            system=system,
            email=payload.get("email"),
            role=payload.get("role", "user")
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

def get_optional_identity(
    authorization: Optional[str] = Header(None),
    x_system_context: Optional[str] = Header(None, alias="X-System-Context")
) -> IdentityContext:
    """
    Versão opcional da identidade (v7.6).
    Se não houver token, retorna um contexto 'Anonymous' baseado no Header de sistema ou 'global'.
    Utilizado para descoberta de módulos e temas públicos.
    """
    if authorization:
        try:
            return get_current_identity(authorization)
        except HTTPException:
            pass # Ignora erro e cai no fallback anônimo
            
    return IdentityContext(
        user_id="anonymous",
        system=x_system_context or "global",
        is_system=True
    )
