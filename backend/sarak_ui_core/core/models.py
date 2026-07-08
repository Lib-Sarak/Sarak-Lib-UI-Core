from sqlalchemy import Column, String, JSON, DateTime, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.ext.mutable import MutableDict
import uuid

try:
    from .database import Base
except ImportError:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()

class SystemBranding(Base):
    """
    Tabela soberana para persistência da identidade visual corporativa.
    """
    __tablename__ = "system_branding"
    __table_args__ = {"schema": "ui_core"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    system = Column(String(50), default="global", index=True)
    owner_id = Column(UUID(as_uuid=True), nullable=True) # Referência opcional para o tenant/usuário
    company_name = Column(String(255), default="Sarak OS")
    login_name = Column(String(255), default="Acesso ao Sistema")
    tab_name = Column(String(255), default="Sarak OS")
    from sqlalchemy.dialects.postgresql import TEXT
    logo_base64 = Column(TEXT, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CustomTheme(Base):
    """
    Tabela única e soberana para persistência de temas híbridos (Sarak-UI-Core).
    Schema: ui_core
    """
    __tablename__ = "custom_themes"
    __table_args__ = {"schema": "ui_core"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    system = Column(String(50), default="global", index=True)
    owner_id = Column(UUID(as_uuid=True), nullable=True) # Referência opcional para o tenant/usuário
    is_public = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False) # Aponta se este é o tema ativo atual
    
    # Top-Level Globals
    mode = Column(String(50), default='dark')
    navigation_style = Column(String(50), default='sidebar')
    body_size = Column(String(50), default='14px')
    
    # Colunas JSONB Granulares
    branding_config = Column(MutableDict.as_mutable(JSON), default={})
    colors_and_atmosphere = Column(MutableDict.as_mutable(JSON), default={})
    typography = Column(MutableDict.as_mutable(JSON), default={})
    layout_and_navigation = Column(MutableDict.as_mutable(JSON), default={})
    components_base = Column(MutableDict.as_mutable(JSON), default={})
    cards_engine = Column(MutableDict.as_mutable(JSON), default={})
    data_and_charts = Column(MutableDict.as_mutable(JSON), default={})
    motion_and_animation = Column(MutableDict.as_mutable(JSON), default={})
    specialized_engines = Column(MutableDict.as_mutable(JSON), default={})
    structural = Column(MutableDict.as_mutable(JSON), default={})
    legacy_and_runtime = Column(MutableDict.as_mutable(JSON), default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "system": self.system,
            "owner_id": str(self.owner_id) if self.owner_id else None,
            "is_public": self.is_public,
            "is_active": self.is_active,
            "design": {
                # Merge lógico para enviar ao Frontend
                "mode": self.mode,
                "navigation_style": self.navigation_style,
                "body_size": self.body_size,
                **self.branding_config,
                **self.colors_and_atmosphere,
                **self.typography,
                **self.layout_and_navigation,
                **self.components_base,
                **self.cards_engine,
                **self.data_and_charts,
                **self.motion_and_animation,
                **self.specialized_engines,
                **self.structural,
                **self.legacy_and_runtime
            }
        }

class DesignAgentConversation(Base):
    """
    Tabela para armazenar o histórico de conversas do Agente de Design.
    """
    __tablename__ = "sarak_ui_design_agent_conversations"
    __table_args__ = {"schema": "ui_core"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    role = Column(String(50), nullable=False) # 'user', 'assistant', 'system'
    from sqlalchemy.dialects.postgresql import TEXT
    content = Column(TEXT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DesignAgentArtifact(Base):
    """
    Tabela para armazenar os payloads validados (temas/presets) gerados pelo Agente.
    """
    __tablename__ = "sarak_ui_design_agent_artifacts"
    __table_args__ = {"schema": "ui_core"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    artifact_type = Column(String(50), nullable=False) # 'theme', 'preset'
    payload = Column(MutableDict.as_mutable(JSON), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
