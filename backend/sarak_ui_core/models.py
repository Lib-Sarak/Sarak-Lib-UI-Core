from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.ext.mutable import MutableDict
import uuid

try:
    from .database import Base
except ImportError:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()

class UserDesignConfig(Base):
    """
    Representação soberana das configurações de interface (tema, layout, cores) por usuário.
    Schema: ui_core
    """
    __tablename__ = "user_design"
    __table_args__ = {"schema": "ui_core"}

    user_id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    
    # Objeto de design completo do SarakUIProvider (v6.7)
    # Ex: {"mode": "dark", "primaryColor": "#3b82f6", "layout": "glass", ...}
    design = Column(MutableDict.as_mutable(JSON), default={}, nullable=False)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "user_id": str(self.user_id),
            "design": self.design,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
