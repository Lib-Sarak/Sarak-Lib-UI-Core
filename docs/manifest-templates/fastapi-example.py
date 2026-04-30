from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Importante para permitir que a UI-Core acesse seu manifesto de domínios diferentes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/module/manifest")
async def get_sarak_manifest():
    """
    Este é o coração da integração Sarak UI v9.0.
    A interface do seu sistema é definida aqui, no Backend.
    """
    return {
        "id": "meu-microsservico-id",
        "label": "Gestão Industrial",
        "icon": "Factory",           # Nome de qualquer ícone do Lucide React
        "category": "Operacional",    # Agrupador na barra lateral
        "priority": 500,              # Ordem na barra lateral (maior = mais alto)
        "visualContracts": [
            {
                "id": "kpi-dashboard",
                "type": "STATS",      # Renderiza cards de métricas
                "role": "primary",    # Usa a cor primária definida na Personalização
                "label": "Telemetria em Tempo Real",
                "endpoint": "/api/v1/telemetry"
            },
            {
                "id": "device-list",
                "type": "TABLE",      # Renderiza uma tabela industrial
                "role": "neutral",
                "label": "Sensores Ativos",
                "endpoint": "/api/v1/devices",
                "mapping": {
                    "Identificador": "id",
                    "Leitura": "value",
                    "Status": "status"
                }
            }
        ]
    }

@app.get("/api/v1/telemetry")
async def get_telemetry():
    return {"total": 1250, "active": 1180, "warnings": 12}

@app.get("/api/v1/devices")
async def get_devices():
    return [
        {"id": "SNS-001", "value": "24.5°C", "status": "ok"},
        {"id": "SNS-002", "value": "28.1°C", "status": "warning"}
    ]
