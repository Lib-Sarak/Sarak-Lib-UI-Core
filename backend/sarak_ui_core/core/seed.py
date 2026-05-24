import logging
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

def seed_ui_core(engine: Engine):
    """
    Semeador obsoleto. As tabelas antigas (system_modules) foram removidas da arquitetura.
    Mantido vazio temporariamente para evitar quebras de import.
    """
    pass
