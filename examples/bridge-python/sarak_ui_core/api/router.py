from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid as uuid_pkg
from typing import Dict, Any

from ..core.database import get_db, engine, setup_ui_db
from ..core.models import UserDesignConfig, SystemModule
from ..core.seed import seed_ui_core
from ..core.security import get_current_identity, get_optional_identity, IdentityContext
from pydantic import BaseModel
from typing import List

router = APIRouter(tags=["UI Core Settings"])

@router.on_event("startup")
def sovereign_boot():
    """Inicialização soberana do módulo UI-Core (v5.5)"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(" [Sarak OS] Inicializando módulo: UI-Core (Soberano)")
    
    # Setup DB (Schema + Tables)
    setup_ui_db(engine)
    
    # Injetar Seeds de Sistema (v6.5)
    seed_ui_core(engine)
    
    logger.info(" [Sarak OS] Módulo UI-Core pronto.")

@router.get("/module/manifest")
def get_module_manifest():
    """Expondo o manifesto para o motor de descoberta do UI-Core (v5.5)."""
    import os
    import json
    manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../manifest.json"))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifesto não encontrado na raiz do módulo")

@router.get("/modules")
def get_system_modules(
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_optional_identity)
):
    """Retorna os módulos e abas nativas registrados para o sistema atual (v6.5)."""
    # Filtra por global ou pelo sistema específico do usuário
    modules = db.query(SystemModule).filter(
        SystemModule.is_active == True,
        SystemModule.system.in_(["global", identity.system])
    ).order_by(SystemModule.priority.desc()).all()
    
    return [
        {
            "id": m.id, 
            "label": m.label, 
            "icon": m.icon, 
            "category": m.category, 
            "priority": m.priority
        } for m in modules
    ]

class DesignUpdate(BaseModel):
    design: Dict[str, Any]

@router.get("/design")
def get_user_design(
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_optional_identity)
):
    """Recupera a configuraÃ§Ã£o de design (tema, layout) do usuÃ¡rio logado ou fallback para anÃ´nimo."""
    user_id = identity.user_id
    
    if user_id == "anonymous":
        # Para anônimo, tentamos pegar o design do 'global' para esse sistema
        config = db.query(UserDesignConfig).filter(
            UserDesignConfig.system == identity.system
        ).first()
        if config:
            return config.to_dict()
        return {"design": {}}

    try:
        user_id_uuid = uuid_pkg.UUID(user_id) if isinstance(user_id, str) else user_id
    except ValueError:
        return {"design": {}}
    
    config = db.query(UserDesignConfig).filter(
        UserDesignConfig.user_id == user_id_uuid,
        UserDesignConfig.system == identity.system
    ).first()
    
    if not config:
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
    
    config = db.query(UserDesignConfig).filter(
        UserDesignConfig.user_id == user_id_uuid,
        UserDesignConfig.system == identity.system
    ).first()
    
    if not config:
        config = UserDesignConfig(
            user_id=user_id_uuid, 
            system=identity.system,
            design=update.design
        )
        db.add(config)
    else:
        config.design = update.design
        
    db.commit()
    db.refresh(config)
    return config.to_dict()
