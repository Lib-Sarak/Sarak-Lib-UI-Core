from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid as uuid_pkg
from typing import Dict, Any

from sarak_ui_core.database import get_db, engine, setup_ui_db
from sarak_ui_core.models import UserDesignConfig, SystemModule
from sarak_ui_core.seed import seed_ui_core
from sarak_ui_core.security import get_current_identity, IdentityContext
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
def get_system_modules(db: Session = Depends(get_db)):
    """Retorna os mÃ³dulos e abas nativas registradas via Seed (v6.5)."""
    modules = db.query(SystemModule).filter(SystemModule.is_active == True).order_by(SystemModule.priority.desc()).all()
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
