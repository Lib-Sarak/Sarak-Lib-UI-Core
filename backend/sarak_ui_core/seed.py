import logging
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

def seed_ui_core(engine: Engine):
    """
    Popula os módulos de sistema nativos do UI-Core (v6.5 Elite).
    Soberania de dados: Registro dinâmico de abas nativas.
    """
    from .models import SystemModule
    
    Session = sessionmaker(bind=engine)
    db = Session()
    
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
        count = 0
        for m_data in modules:
            exists = db.query(SystemModule).filter(SystemModule.id == m_data["id"]).first()
            if not exists:
                new_m = SystemModule(**m_data)
                db.add(new_m)
                count += 1
        
        if count > 0:
            db.commit()
            logger.info(f" [+] UI-Core (Seed): {count} módulos de sistema injetados com sucesso.")
        else:
            logger.debug(" [.] UI-Core (Seed): Módulos nativos já registrados.")
            
    except Exception as e:
        db.rollback()
        logger.error(f" [!] UI-Core (Seed): Erro crítico ao injetar módulos: {e}")
    finally:
        db.close()
