from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid as uuid_pkg
from typing import Dict, Any, Optional
import json
import os

from ..core.database import get_db, engine, setup_ui_db
from ..core.models import CustomTheme, SystemBranding
from ..core.seed import seed_ui_core
from ..core.security import get_current_identity, get_optional_identity, IdentityContext
from pydantic import BaseModel

try:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    mapping_path = os.path.join(base_dir, 'src', 'core', 'Design', 'catalog', 'theme_table_mapping.json')
    
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
    print("\n\n[SARAK UI CORE DEBUG] === INICIANDO SALVAMENTO DE DESIGN NO BANCO (POST /design) ===")
    
    """Atualiza as propriedades do tema ativo do usuário, ou cria um novo tema ativo."""
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    # Localiza o tema ativo atual do usuario para este sistema
    theme = db.query(CustomTheme).filter(
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system,
        CustomTheme.is_active == True
    ).first()
    
    if not theme:
        print("[SARAK UI CORE DEBUG] Tema não encontrado. Criando um novo tema ativo.")
        theme = CustomTheme(
            name="Personalizado",
            owner_id=user_id_uuid, 
            system=identity.system,
            is_active=True
        )
        db.add(theme)
    else:
        print(f"[SARAK UI CORE DEBUG] Tema encontrado. ID: {theme.id}")
    
    # Merge lógico: iteramos os campos e atualizamos
    GRANULAR_COLUMNS = [
        'branding_config', 'colors_and_atmosphere', 'typography', 
        'layout_and_navigation', 'components_base', 'cards_engine', 
        'data_and_charts', 'motion_and_animation', 'specialized_engines',
        'legacy_and_runtime'
    ]
    
    granular_data = {}
    for col in GRANULAR_COLUMNS:
        val = getattr(theme, col, None)
        granular_data[col] = dict(val) if val else {}
    
    print(f"[SARAK UI CORE DEBUG] Recebidos {len(update.design.items())} itens para atualizar.")
    
    for key, value in update.design.items():
        if hasattr(theme, key) and key not in ['id', 'created_at', 'updated_at', 'owner_id', 'system']:
            setattr(theme, key, value)
        elif key not in ['id', 'created_at', 'updated_at', 'owner_id', 'system']:
            is_valid_key = False
            for col, fields in THEME_MAPPING.items():
                if key in fields and col in GRANULAR_COLUMNS:
                    granular_data[col][key] = value
                    is_valid_key = True
                    break
            
            if not is_valid_key:
                print(f"[SARAK UI CORE DEBUG] Regra 4: Chave '{key}' não encontrada no catálogo. Descartando.")
            
    from sqlalchemy.orm.attributes import flag_modified
    for col in GRANULAR_COLUMNS:
        keys_count = len(granular_data[col].keys())
        if keys_count > 0:
            print(f"[SARAK UI CORE DEBUG] Gravando coluna {col} com {keys_count} chaves.")
        setattr(theme, col, granular_data[col])
        flag_modified(theme, col)
        
    try:
        db.commit()
        db.refresh(theme)
        print("[SARAK UI CORE DEBUG] === SALVAMENTO CONCLUIDO COM SUCESSO NO BANCO ===\n\n")
    except Exception as e:
        print(f"[SARAK UI CORE DEBUG] Erro ao salvar no banco: {str(e)}\n\n")
        db.rollback()
        
    return theme.to_dict()

class BrandingUpdate(BaseModel):
    branding: Dict[str, Any]

@router.get("/branding")
def get_branding(
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_optional_identity)
):
    user_id = identity.user_id
    try:
        user_id_uuid = uuid_pkg.UUID(user_id) if isinstance(user_id, str) and user_id != "anonymous" else None
    except ValueError:
        user_id_uuid = None

    theme = None
    if user_id_uuid:
        theme = db.query(SystemBranding).filter(
            SystemBranding.owner_id == user_id_uuid,
            SystemBranding.system == identity.system
        ).first()
    
    if not theme:
        theme = db.query(SystemBranding).filter(
            SystemBranding.system == identity.system,
            SystemBranding.owner_id == None
        ).first()

    if theme:
        return {"branding": {
            "companyName": theme.company_name,
            "loginName": theme.login_name,
            "tabName": theme.tab_name,
            "logoBase64": theme.logo_base64
        }}
    return {"branding": {}}

@router.post("/branding")
def update_branding(
    update: BrandingUpdate,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_optional_identity)
):
    user_id = identity.user_id
    try:
        user_id_uuid = uuid_pkg.UUID(user_id) if isinstance(user_id, str) and user_id != "anonymous" else None
    except ValueError:
        user_id_uuid = None

    theme = None
    if user_id_uuid:
        theme = db.query(SystemBranding).filter(
            SystemBranding.owner_id == user_id_uuid,
            SystemBranding.system == identity.system
        ).first()
    
    if not theme:
        theme = db.query(SystemBranding).filter(
            SystemBranding.system == identity.system,
            SystemBranding.owner_id == None
        ).first()

    if not theme:
        theme = SystemBranding(
            owner_id=user_id_uuid,
            system=identity.system
        )
        db.add(theme)
    
    b = update.branding
    if "companyName" in b: theme.company_name = b["companyName"]
    if "loginName" in b: theme.login_name = b["loginName"]
    if "tabName" in b: theme.tab_name = b["tabName"]
    if "logoBase64" in b: theme.logo_base64 = b["logoBase64"]

    db.commit()
    db.refresh(theme)
    return {"success": True}

# ==========================================
# THEMES CATALOG CRUD (Substitui db-mock.ts)
# ==========================================

from typing import List

class ThemeCreateUpdate(BaseModel):
    name: str
    design: Dict[str, Any]
    is_active: Optional[bool] = False

@router.get("/themes")
def list_themes(
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    themes = db.query(CustomTheme).filter(
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system
    ).all()
    
    return [t.to_dict() for t in themes]

def _apply_design_to_theme(theme: CustomTheme, design: Dict[str, Any]):
    GRANULAR_COLUMNS = [
        'branding_config', 'colors_and_atmosphere', 'typography', 
        'layout_and_navigation', 'components_base', 'cards_engine', 
        'data_and_charts', 'motion_and_animation', 'specialized_engines'
    ]
    
    granular_data = {}
    for col in GRANULAR_COLUMNS:
        val = getattr(theme, col, None)
        granular_data[col] = dict(val) if val else {}
    
    for key, value in design.items():
        if hasattr(theme, key) and key not in ['id', 'created_at', 'updated_at', 'owner_id', 'system']:
            setattr(theme, key, value)
        elif key not in ['id', 'created_at', 'updated_at', 'owner_id', 'system']:
            is_valid_key = False
            for col, fields in THEME_MAPPING.items():
                if key in fields and col in GRANULAR_COLUMNS:
                    granular_data[col][key] = value
                    is_valid_key = True
                    break
            
            if not is_valid_key:
                # Regra 4: Descarta chave inválida silenciosamente
                pass
            
    from sqlalchemy.orm.attributes import flag_modified
    for col in GRANULAR_COLUMNS:
        setattr(theme, col, granular_data[col])
        flag_modified(theme, col)

@router.post("/themes")
def create_theme(
    payload: ThemeCreateUpdate,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    if payload.is_active:
        db.query(CustomTheme).filter(
            CustomTheme.owner_id == user_id_uuid,
            CustomTheme.system == identity.system,
            CustomTheme.is_active == True
        ).update({"is_active": False})
        
    new_theme = CustomTheme(
        name=payload.name,
        owner_id=user_id_uuid,
        system=identity.system,
        is_active=payload.is_active
    )
    db.add(new_theme)
    _apply_design_to_theme(new_theme, payload.design)
    
    db.commit()
    db.refresh(new_theme)
    return new_theme.to_dict()

@router.put("/themes/{theme_id}")
def update_theme(
    theme_id: str,
    payload: ThemeCreateUpdate,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    theme = db.query(CustomTheme).filter(
        CustomTheme.id == theme_id,
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system
    ).first()
    
    if not theme:
        raise HTTPException(status_code=404, detail="Tema não encontrado")
        
    theme.name = payload.name
    
    if payload.is_active:
        db.query(CustomTheme).filter(
            CustomTheme.owner_id == user_id_uuid,
            CustomTheme.system == identity.system,
            CustomTheme.id != theme_id,
            CustomTheme.is_active == True
        ).update({"is_active": False})
        theme.is_active = True
        
    _apply_design_to_theme(theme, payload.design)
    
    db.commit()
    db.refresh(theme)
    return theme.to_dict()

@router.put("/themes/{theme_id}/activate")
def activate_theme(
    theme_id: str,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    theme = db.query(CustomTheme).filter(
        CustomTheme.id == theme_id,
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system
    ).first()
    
    if not theme:
        raise HTTPException(status_code=404, detail="Tema não encontrado")
        
    db.query(CustomTheme).filter(
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system,
        CustomTheme.is_active == True
    ).update({"is_active": False})
    
    theme.is_active = True
    db.commit()
    return {"success": True}

@router.delete("/themes/{theme_id}")
def delete_theme(
    theme_id: str,
    db: Session = Depends(get_db),
    identity: IdentityContext = Depends(get_current_identity)
):
    user_id_uuid = uuid_pkg.UUID(identity.user_id) if isinstance(identity.user_id, str) else identity.user_id
    
    theme = db.query(CustomTheme).filter(
        CustomTheme.id == theme_id,
        CustomTheme.owner_id == user_id_uuid,
        CustomTheme.system == identity.system
    ).first()
    
    if not theme:
        raise HTTPException(status_code=404, detail="Tema não encontrado")
        
    db.delete(theme)
    db.commit()
    return {"success": True}
