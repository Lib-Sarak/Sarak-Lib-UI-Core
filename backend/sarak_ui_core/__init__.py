"""
Sarak-Lib-UI-Core — Backend Soberano para gestão de interface e design.
"""
from sarak_ui_core.api.router import router
from sarak_ui_core.database import setup_ui_db

__all__ = [
    "setup_ui_db",
    "router",
]
