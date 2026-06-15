from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import employees, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ACME Salary Management API",
    version="1.0.0",
    description="HR salary management for 10,000 employees"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok"}