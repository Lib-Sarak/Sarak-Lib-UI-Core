import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURAÇÃO DE BANCO SOBERANA UI (v5.5) ---
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("A variável de ambiente DATABASE_URL não está configurada.")
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def setup_ui_db(ext_engine=None):
    """Garante que o schema 'ui_core' exista e as tabelas sejam criadas."""
    target_engine = ext_engine or engine
    
    with target_engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS ui_core"))
        
    # Importação local para evitar referências circulares
    from .models import CustomTheme
    Base.metadata.create_all(bind=target_engine)

    with target_engine.connect() as conn:
        try:
            # Self-healing isolado para custom_themes
            conn.execute(text("ALTER TABLE ui_core.custom_themes ADD COLUMN IF NOT EXISTS system VARCHAR(50) DEFAULT 'global'"))
            conn.execute(text("ALTER TABLE ui_core.custom_themes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false"))
            conn.execute(text("ALTER TABLE ui_core.custom_themes ADD COLUMN IF NOT EXISTS structural JSONB DEFAULT '{}'::jsonb"))
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f" [!] UI-DB Migration info (CustomTheme): {e}")
    
    print(">>> [UI-Core DB] Soberania: Schema 'ui_core' verificado com sucesso.")
