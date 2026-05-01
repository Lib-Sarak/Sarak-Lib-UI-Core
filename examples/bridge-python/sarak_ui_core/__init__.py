"""
Sarak-Lib-UI-Core — Backend Soberano para gestão de interface e design.
"""
from .api.router import router
from .core.database import setup_ui_db

__all__ = [
    "setup_ui_db",
    "router",
]
