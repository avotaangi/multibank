from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
import logging
from contextlib import asynccontextmanager

from config import settings
from database import connect_to_mongo, close_mongo_connection
from routers import (
    auth, users, accounts, transactions, telegram, rewards, leads,
    credit_products, cash_loan_applications, card_management,
    card_operations, universal_payments, mobile_payments
)

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.environment == "development" else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    logger.info(f"🚀 Server starting on port {settings.port}")
    logger.info(f"📱 Environment: {settings.environment}")
    yield
    # Shutdown
    await close_mongo_connection()
    logger.info("Server shutting down")

# Create FastAPI app
app = FastAPI(
    title="MultiBank API",
    description="MultiBank Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(telegram.router, prefix="/api/telegram", tags=["telegram"])
app.include_router(rewards.router, prefix="/api/rewards", tags=["rewards"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(credit_products.router, prefix="/api/credit-products", tags=["credit-products"])
app.include_router(cash_loan_applications.router, prefix="/api/cash-loan-applications", tags=["cash-loan-applications"])
app.include_router(card_management.router, prefix="/api/card-management", tags=["card-management"])
app.include_router(card_operations.router, prefix="/api/card-operations", tags=["card-operations"])
app.include_router(universal_payments.router, prefix="/api/universal-payments", tags=["universal-payments"])
app.include_router(mobile_payments.router, prefix="/api/mobile-payments", tags=["mobile-payments"])

# Health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "timestamp": time.time(),
        "environment": settings.environment
    }

# Root endpoint
@app.get("/")
async def root():
    return {"message": "MultiBank API", "version": "1.0.0"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "message": "Something went wrong!",
            "error": str(exc) if settings.environment == "development" else "Internal server error"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )

