# app/main.py — REMPLACER par ce contenu
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from app.database import engine, Base
from app.routers import auth, etudiants, professeurs, reservations, chatbot, matching, admin, avis, messages
from app.routers import chatbot_sessions   # ← NOUVEAU
from dotenv import load_dotenv

from app.routers import admin_finances  # ← ligne 1


load_dotenv()

Base.metadata.create_all(bind=engine)
app = FastAPI(title="EduMatch API")

os.makedirs("static/uploads/profiles", exist_ok=True)
os.makedirs("static/uploads/certificats", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content={}, status_code=200)
        response.headers["Access-Control-Allow-Origin"]      = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Max-Age"]           = "86400"
        return response
    response = await call_next(request)
    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"]      = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization, X-Requested-With"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,              prefix="/api/auth",         tags=["Auth"])
app.include_router(etudiants.router,         prefix="/api/etudiants",    tags=["Etudiants"])
app.include_router(professeurs.router,       prefix="/api/professeurs",  tags=["Professeurs"])
app.include_router(reservations.router,      prefix="/api/reservations", tags=["Réservations"])
app.include_router(admin.router,             prefix="/api/admin",        tags=["Admin"])
app.include_router(chatbot.router,           prefix="/api/chatbot",      tags=["Chatbot"])
app.include_router(chatbot_sessions.router,  prefix="/api/chatbot",      tags=["ChatSessions"])  # ← NOUVEAU
app.include_router(matching.router,          prefix="/api/matching",     tags=["Matching"])
app.include_router(avis.router,              prefix="/api/avis",         tags=["Avis"])
app.include_router(messages.router,          prefix="/api/messages",     tags=["Messages"])

app.include_router(admin_finances.router, prefix="/api/admin/finances", tags=["Finances"])  # ← ligne 2


@app.get("/")
def root():
    return {"message": "API EduMatch en ligne ✅"}