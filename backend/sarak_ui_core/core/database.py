import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURAÇÃO DE BANCO SOBERANA UI (v5.5) ---
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sarak_db")

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
    
    with target_engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS ui_core"))
        conn.commit()
    
    # Importação local para evitar referências circulares
    from .models import UserDesignConfig
    Base.metadata.create_all(bind=target_engine)
    print(">>> [UI-Core DB] Soberania: Schema 'ui_core' verificado com sucesso.")
