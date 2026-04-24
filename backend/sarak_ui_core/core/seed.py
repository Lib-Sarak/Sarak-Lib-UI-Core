import logging
import os
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

def seed_ui_core(engine: Engine):
    """
    Popula os módulos de sistema nativos do UI-Core (v7.6).
    Garante que abas como 'Personalização' existam no contexto do sistema atual.
    """
    from .models import SystemModule
    
    Session = sessionmaker(bind=engine)
    db = Session()
    
    # Identifica os sistemas para semear
    target_system = os.getenv("SARAK_SYSTEM_NAME", "MyService")
    systems_to_seed = ["global", target_system]
    
    modules = [
        {
            "id": "mx-customization",
            "label": "Personalização",
            "icon": "Palette",
            "category": "Design & UX",
            "priority": 1000,
            "is_active": True
        }
    ]
    
    try:
        total_injected = 0
        for sys_name in systems_to_seed:
            for m_data in modules:
                exists = db.query(SystemModule).filter(
                    SystemModule.id == m_data["id"],
                    SystemModule.system == sys_name
                ).first()
                
                if not exists:
                    new_m = SystemModule(**m_data, system=sys_name)
                    db.add(new_m)
                    total_injected += 1
        
        if total_injected > 0:
            db.commit()
            logger.info(f" [+] UI-Core (Seed): {total_injected} módulos injetados nos sistemas {systems_to_seed}.")
        else:
            logger.debug(" [.] UI-Core (Seed): Módulos nativos já registrados em todos os contextos.")
            
    except Exception as e:
        db.rollback()
        logger.error(f" [!] UI-Core (Seed): Erro crítico ao injetar módulos: {e}")
    finally:
        db.close()
