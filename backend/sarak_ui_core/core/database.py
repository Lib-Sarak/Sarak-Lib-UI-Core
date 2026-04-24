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
    
    with target_engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS ui_core"))
        
    with target_engine.connect() as conn:
        # Migração Self-Healing (v7.6)
        tables_pk = {
            "user_design": "user_id",
            "system_modules": "id"
        }
        for table, pk_col in tables_pk.items():
            try:
                # 1. Garantir que a coluna 'system' existe
                conn.execute(text(f"ALTER TABLE ui_core.{table} ADD COLUMN IF NOT EXISTS system VARCHAR(50) DEFAULT 'global'"))
                
                # 2. Verificar se a PK atual já inclui 'system'
                # Se não incluir, precisamos recriar a PK para ser composta
                pk_check = f"""
                    SELECT count(*) FROM information_schema.key_column_usage 
                    WHERE table_schema = 'ui_core' AND table_name = '{table}' AND column_name = 'system'
                """
                is_composite = conn.execute(text(pk_check)).scalar()
                
                if is_composite == 0:
                    print(f" [Migration] Convertendo PK de {table} para composta (Soberania v7.6)...")
                    # Remove PK antiga (geralmente nomeada como {table}_pkey no PG)
                    conn.execute(text(f"ALTER TABLE ui_core.{table} DROP CONSTRAINT IF EXISTS {table}_pkey CASCADE"))
                    # Adiciona nova PK composta
                    conn.execute(text(f"ALTER TABLE ui_core.{table} ADD PRIMARY KEY ({pk_col}, system)"))
                
                conn.commit()
            except Exception as e:
                print(f" [!] UI-DB Migration info (Table {table}): {e}")
    
    # Importação local para evitar referências circulares
    from .models import UserDesignConfig
    Base.metadata.create_all(bind=target_engine)
    print(">>> [UI-Core DB] Soberania: Schema 'ui_core' verificado com sucesso.")
