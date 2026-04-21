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
    email: Optional[str] = None
    role: Optional[str] = None
    is_system: bool = False

def get_current_identity(authorization: Optional[str] = Header(None)) -> IdentityContext:
    """
    Validador de Identidade Soberano (v5.5).
    Decodifica o JWT localmente sem depender do mÃ³dulo de Auth-Identity em runtime.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorizaÃ§Ã£o nÃ£o fornecido."
        )

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invÃ¡lido: ID de usuÃ¡rio ausente.")

        return IdentityContext(
            user_id=user_id,
            email=payload.get("email"),
            role=payload.get("role", "user")
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token invÃ¡lido: {str(e)}")
    except Exception as e:
        logger.error(f"[UI-Core Security] Erro inesperado: {e}")
        raise HTTPException(status_code=500, detail="Erro interno na validaÃ§Ã£o de identidade.")
