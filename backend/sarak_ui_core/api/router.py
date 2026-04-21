from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid as uuid_pkg
from typing import Dict, Any

from sarak_ui_core.database import get_db
from sarak_ui_core.models import UserDesignConfig
from sarak_ui_core.security import get_current_identity, IdentityContext
from pydantic import BaseModel

router = APIRouter(tags=["UI Core Settings"])

class DesignUpdate(BaseModel):
    design: Dict[str, Any]

@router.get("/design")
def get_user_design(
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    """Recupera a configuraÃ§Ã£o de design (tema, layout) do usuÃ¡rio logado."""
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    config = db.query(UserDesignConfig).filter(UserDesignConfig.user_id == user_id_uuid).first()
    if not config:
        # Se nÃ£o existir, nÃ£o criamos ainda, apenas retornamos vazio para o frontend usar defaults
        return {"design": {}}
        
    return config.to_dict()

@router.post("/design")
def update_user_design(
    update: DesignUpdate,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    """Salva ou atualiza a configuraÃ§Ã£o de design do usuÃ¡rio."""
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    config = db.query(UserDesignConfig).filter(UserDesignConfig.user_id == user_id_uuid).first()
    
    if not config:
        config = UserDesignConfig(user_id=user_id_uuid, design=update.design)
        db.add(config)
    else:
        # Atualiza o dicionÃ¡rio existente (MutableDict detecta a mudanÃ§a)
        config.design = update.design
        
    db.commit()
    db.refresh(config)
    return config.to_dict()
