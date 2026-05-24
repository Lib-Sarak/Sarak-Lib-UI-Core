from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid as uuid_pkg
from typing import Dict, Any
import json
import os

from ..core.database import get_db, engine, setup_ui_db
from ..core.models import CustomTheme
from ..core.seed import seed_ui_core
from ..core.security import get_current_identity, get_optional_identity, IdentityContext
from pydantic import BaseModel

try:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    mapping_path = os.path.join(base_dir, 'src', 'core', 'Design', 'schema', 'theme_table_mapping.json')
    
    with open(mapping_path, 'r', encoding='utf-8') as f:
        THEME_MAPPING = json.load(f)
except Exception:
    THEME_MAPPING = {}

router = APIRouter(tags=["UI Core Settings"])

@router.on_event("startup")
def sovereign_boot():
    """Inicialização soberana do módulo UI-Core (v7.7 - Single Table)"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(" [Sarak OS] Inicializando módulo: UI-Core (Soberano Single-Table)")
    
    # Setup DB (Schema + Table CustomThemes)
    setup_ui_db(engine)
    
    # Chamada obsoleto/vazia apenas para evitar quebra caso algo no MyService chame
    seed_ui_core(engine)
    
    logger.info(" [Sarak OS] Módulo UI-Core pronto.")

@router.get("/module/manifest")
def get_module_manifest():
    """Expondo o manifesto para o motor de descoberta do UI-Core."""
    import os
    import json
    manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../manifest.json"))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Manifesto não encontrado na raiz do módulo")

class DesignUpdate(BaseModel):
    design: Dict[str, Any]

@router.get("/design")
def get_user_design(
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_optional_identity)
):
    """Recupera o tema ATIVO (is_active=True) para o sistema atual, com fallback para o tema global ativo."""
    user_id = identity.user_id
    
    if user_id == "anonymous":
        theme = db.query(CustomTheme).filter(
            CustomTheme.system == identity.system, 
            CustomTheme.is_active == True
        ).first()
        return theme.to_dict() if theme else {"design": {}}

    try:
        user_id_uuid = uuid_pkg.UUID(user_id) if isinstance(user_id, str) else user_id
    except ValueError:
        return {"design": {}}
    
    # 1. Tenta pegar o tema ativo do usuário específico neste sistema
    theme = db.query(CustomTheme).filter(
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system,
        CustomTheme.is_active == True
    ).first()
    
    # 2. Fallback: Pega o tema global ativo para o sistema
    if not theme:
        theme = db.query(CustomTheme).filter(
            CustomTheme.system == identity.system,
            CustomTheme.is_active == True,
            CustomTheme.owner_id == None
        ).first()

    return theme.to_dict() if theme else {"design": {}}

@router.post("/design")
def update_user_design(
    update: DesignUpdate,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    """Atualiza as propriedades do tema ativo do usuário, ou cria um novo tema ativo."""
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    # Localiza o tema ativo atual do usuario para este sistema
    theme = db.query(CustomTheme).filter(
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system,
        CustomTheme.is_active == True
    ).first()
    
    if not theme:
        theme = CustomTheme(
            name="Personalizado",
            owner_id=user_id_uuid, 
            system=identity.system,
            is_active=True
        )
        db.add(theme)
    
    # Merge lógico: iteramos os campos e atualizamos
    # O frontend envia um objeto "design" flat. Lemos o mapeamento para 
    # rotear os valores paras as colunas JSONB correspondentes.
    GRANULAR_COLUMNS = [
        'branding_config', 'colors_and_atmosphere', 'typography', 
        'layout_and_navigation', 'components_base', 'cards_engine', 
        'data_and_charts', 'motion_and_animation', 'specialized_engines'
    ]
    
    granular_data = {}
    for col in GRANULAR_COLUMNS:
        val = getattr(theme, col, None)
        granular_data[col] = dict(val) if val else {}
    
    for key, value in update.design.items():
        if hasattr(theme, key) and key not in ['id', 'created_at', 'updated_at', 'owner_id', 'system']:
            setattr(theme, key, value)
        elif key not in ['id', 'created_at', 'updated_at', 'owner_id', 'system']:
            found_col = 'branding_config' # fallback
            for col, fields in THEME_MAPPING.items():
                if key in fields and col in GRANULAR_COLUMNS:
                    found_col = col
                    break
            granular_data[found_col][key] = value
            
    for col in GRANULAR_COLUMNS:
        setattr(theme, col, granular_data[col])
        
    db.commit()
    db.refresh(theme)
    return theme.to_dict()
