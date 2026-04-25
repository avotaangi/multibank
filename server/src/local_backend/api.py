from __future__ import annotations

import base64
import copy
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware

from .store import LocalBackendStore


TEAM_ID = "team096"
DEFAULT_CLIENT_ID = f"{TEAM_ID}-1"


def now_iso(offset_days: int = 0) -> str:
    return (datetime.utcnow() + timedelta(days=offset_days)).replace(microsecond=0).isoformat() + "Z"


def pdf_base64(title: str) -> str:
    content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 58 >>
stream
BT
/F1 16 Tf
24 96 Td
({title}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000348 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
418
%%EOF"""
    return base64.b64encode(content.encode("utf-8")).decode("ascii")


def seed_state() -> Dict[str, Any]:
    general_transactions = [
        {
            "id": "tx-001",
            "transactionId": "tx-001",
            "accountId": "acc-vbank-main",
            "bank": "vbank",
            "type": "deposit",
            "status": "completed",
            "currency": "RUB",
            "amount": 1250000,
            "description": "Зачисление зарплаты",
            "reference": "salary-apr",
            "createdAt": now_iso(-5),
            "bookingDateTime": now_iso(-5),
            "creditDebitIndicator": "Credit",
            "transactionInformation": "Зачисление зарплаты",
            "fromAccount": None,
            "toAccount": {"accountNumber": "40702810900000000001"},
        },
        {
            "id": "tx-002",
            "transactionId": "tx-002",
            "accountId": "acc-vbank-main",
            "bank": "vbank",
            "type": "payment",
            "status": "completed",
            "currency": "RUB",
            "amount": 189990,
            "description": "Оплата маркетплейса",
            "reference": "marketplace-order",
            "createdAt": now_iso(-4),
            "bookingDateTime": now_iso(-4),
            "creditDebitIndicator": "Debit",
            "transactionInformation": "Оплата маркетплейса",
            "fromAccount": {"accountNumber": "40702810900000000001"},
            "toAccount": {"accountNumber": "30101810400000000225"},
        },
        {
            "id": "tx-003",
            "transactionId": "tx-003",
            "accountId": "acc-abank-main",
            "bank": "abank",
            "type": "withdrawal",
            "status": "completed",
            "currency": "RUB",
            "amount": 540000,
            "description": "Погашение кредита",
            "reference": "loan-payment",
            "createdAt": now_iso(-3),
            "bookingDateTime": now_iso(-3),
            "creditDebitIndicator": "Debit",
            "transactionInformation": "Погашение кредита",
            "fromAccount": {"accountNumber": "40702810100000000002"},
            "toAccount": {"accountNumber": "47422810100000000002"},
        },
        {
            "id": "tx-004",
            "transactionId": "tx-004",
            "accountId": "acc-sbank-main",
            "bank": "sbank",
            "type": "deposit",
            "status": "completed",
            "currency": "RUB",
            "amount": 320000,
            "description": "Кэшбэк и бонусы",
            "reference": "cashback",
            "createdAt": now_iso(-2),
            "bookingDateTime": now_iso(-2),
            "creditDebitIndicator": "Credit",
            "transactionInformation": "Кэшбэк и бонусы",
            "fromAccount": None,
            "toAccount": {"accountNumber": "40702810300000000003"},
        },
        {
            "id": "tx-005",
            "transactionId": "tx-005",
            "accountId": "acc-sbank-main",
            "bank": "sbank",
            "type": "transfer",
            "status": "pending",
            "currency": "RUB",
            "amount": 78000,
            "description": "Перевод между счетами",
            "reference": "internal-transfer",
            "createdAt": now_iso(-1),
            "bookingDateTime": now_iso(-1),
            "creditDebitIndicator": "Debit",
            "transactionInformation": "Перевод между счетами",
            "fromAccount": {"accountNumber": "40702810300000000003"},
            "toAccount": {"accountNumber": "40702810900000000001"},
        },
    ]

    credit_products = [
        {
            "productId": "loan-individual-001",
            "productName": "Кредит наличными Комфорт",
            "productType": "loanIndividual",
            "interestRate": 12.9,
            "minAmount": 50000,
            "maxAmount": 3000000,
            "minTerm": 12,
            "maxTerm": 84,
            "description": "Гибкий кредит для ежедневных задач",
        },
        {
            "productId": "credit-card-001",
            "productName": "Кредитная карта Multi Flex",
            "productType": "creditCard",
            "interestRate": 26.5,
            "minAmount": 15000,
            "maxAmount": 500000,
            "minTerm": 1,
            "maxTerm": 36,
            "description": "Льготный период до 60 дней",
        },
    ]

    return {
        "user": {
            "id": "local-user-1",
            "clientId": DEFAULT_CLIENT_ID,
            "username": "test_user",
            "first_name": "Алина",
            "last_name": "Игнатова",
            "name": "Алина Игнатова",
            "phone": "+79990000001",
            "preferences": {
                "currency": "RUB",
                "notifications": True,
                "theme": "light",
            },
            "security": {"pinSet": True},
        },
        "token": "local-dev-token",
        "banks": {
            "vbank": {"id": "vbank", "name": "ВТБ", "url": "http://localhost:8001/local/vbank"},
            "abank": {"id": "abank", "name": "Альфа-Банк", "url": "http://localhost:8001/local/abank"},
            "sbank": {"id": "sbank", "name": "Сбербанк", "url": "http://localhost:8001/local/sbank"},
        },
        "connected_banks": ["vbank", "abank", "sbank"],
        "balances": {
            "vbank": 185430.55,
            "abank": 92340.10,
            "sbank": 148220.87,
            "vbank_savings": 264500.00,
        },
        "accounts": [
            {
                "id": "acc-vbank-main",
                "accountId": "acc-vbank-main",
                "bank": "vbank",
                "bankName": "ВТБ",
                "accountType": "текущий счет",
                "accountNumber": "40702810900000000001",
                "identification": "40702810900000000001",
                "currency": "RUB",
                "balance": 18543055,
                "availableBalance": 18543055,
                "interestRate": 0.0,
                "status": "active",
                "isDefault": True,
                "publicId": "acc-vbank-main",
            },
            {
                "id": "acc-abank-main",
                "accountId": "acc-abank-main",
                "bank": "abank",
                "bankName": "Альфа-Банк",
                "accountType": "сберегательный",
                "accountNumber": "40702810100000000002",
                "identification": "40702810100000000002",
                "currency": "RUB",
                "balance": 9234010,
                "availableBalance": 9234010,
                "interestRate": 4.5,
                "status": "active",
                "isDefault": False,
                "publicId": "acc-abank-main",
            },
            {
                "id": "acc-sbank-main",
                "accountId": "acc-sbank-main",
                "bank": "sbank",
                "bankName": "Сбербанк",
                "accountType": "накопительный",
                "accountNumber": "40702810300000000003",
                "identification": "40702810300000000003",
                "currency": "RUB",
                "balance": 14822087,
                "availableBalance": 14822087,
                "interestRate": 6.2,
                "status": "active",
                "isDefault": False,
                "publicId": "acc-sbank-main",
            },
        ],
        "cards": {
            "vbank": [
                {
                    "cardId": "vbank-card-1",
                    "publicId": "vbank-card-1",
                    "bank": "vbank",
                    "cardName": "ВТБ Platinum",
                    "cardNumber": "5294 **** **** 2498",
                    "cardNumberFull": "5294123412342498",
                    "maskedPan": "5294 **** **** 2498",
                    "pan": "5294123412342498",
                    "accountId": "acc-vbank-main",
                    "accountNumber": "40702810900000000001",
                    "accountBalance": 185430.55,
                    "status": "ACTIVE",
                    "expiryDate": "12/28",
                }
            ],
            "abank": [
                {
                    "cardId": "abank-card-1",
                    "publicId": "abank-card-1",
                    "bank": "abank",
                    "cardName": "Альфа-Банк Daily",
                    "cardNumber": "3568 **** **** 8362",
                    "cardNumberFull": "3568123412348362",
                    "maskedPan": "3568 **** **** 8362",
                    "pan": "3568123412348362",
                    "accountId": "acc-abank-main",
                    "accountNumber": "40702810100000000002",
                    "accountBalance": 92340.10,
                    "status": "ACTIVE",
                    "expiryDate": "09/27",
                }
            ],
            "sbank": [
                {
                    "cardId": "sbank-card-1",
                    "publicId": "sbank-card-1",
                    "bank": "sbank",
                    "cardName": "Сбербанк Smart",
                    "cardNumber": "6352 **** **** 3923",
                    "cardNumberFull": "6352123412343923",
                    "maskedPan": "6352 **** **** 3923",
                    "pan": "6352123412343923",
                    "accountId": "acc-sbank-main",
                    "accountNumber": "40702810300000000003",
                    "accountBalance": 148220.87,
                    "status": "ACTIVE",
                    "expiryDate": "03/29",
                }
            ],
        },
        "transactions": general_transactions,
        "products": [
            {
                "agreement_id": "dep-vbank-001",
                "bank": "vbank",
                "product_type": "deposit",
                "product_name": "Накопительный счет Плюс",
                "status": "active",
                "amount": 264500.00,
                "agreement_details": {
                    "data": {
                        "product_name": "Накопительный счет Плюс",
                        "amount": 264500.00,
                        "interest_rate": 9.2,
                        "status": "active",
                        "start_date": now_iso(-45)[:10],
                        "maturity_date": now_iso(320)[:10],
                    }
                },
            },
            {
                "agreement_id": "dep-abank-001",
                "bank": "abank",
                "product_type": "deposit",
                "product_name": "Стабильный доход",
                "status": "active",
                "amount": 180000.00,
                "agreement_details": {
                    "data": {
                        "product_name": "Стабильный доход",
                        "amount": 180000.00,
                        "interest_rate": 8.4,
                        "status": "active",
                        "start_date": now_iso(-90)[:10],
                        "maturity_date": now_iso(180)[:10],
                    }
                },
            },
            {
                "agreement_id": "loan-abank-001",
                "bank": "abank",
                "product_type": "loan",
                "product_name": "Кредит на ремонт",
                "status": "active",
                "amount": 550000.00,
                "outstanding_amount": 312450.00,
                "agreement_details": {
                    "data": {
                        "product_name": "Кредит на ремонт",
                        "amount": 550000.00,
                        "account_balance": 312450.00,
                        "interest_rate": 12.9,
                        "status": "active",
                    }
                },
            },
            {
                "agreement_id": "loan-sbank-001",
                "bank": "sbank",
                "product_type": "loan",
                "product_name": "Автокредит Smart",
                "status": "active",
                "amount": 980000.00,
                "outstanding_amount": 681200.00,
                "agreement_details": {
                    "data": {
                        "product_name": "Автокредит Smart",
                        "amount": 980000.00,
                        "account_balance": 681200.00,
                        "interest_rate": 11.4,
                        "status": "active",
                    }
                },
            },
        ],
        "rewards": {
            "externalAccountID": "0dbcb7ee-6c59-483b-966a-44d11557665b",
            "rewardSummary": {
                "rewardType": "POINTS",
                "currencyCode": "PTS",
                "availableBalance": 18420,
            },
            "programDetail": {
                "programId": "loyalty-multibank",
                "description": "Единая программа лояльности по всем подключенным банкам",
                "catalogs": [
                    {
                        "catalogId": "travel",
                        "name": "Путешествия",
                        "description": "Компенсация билетов и отелей",
                        "conversionRate": 1,
                        "minRedeemPoints": 500,
                        "maxRedeemPoints": 15000,
                    },
                    {
                        "catalogId": "cashback",
                        "name": "Рубли на счет",
                        "description": "Конвертация бонусов в рубли",
                        "conversionRate": 1,
                        "minRedeemPoints": 1000,
                        "maxRedeemPoints": 10000,
                    },
                ],
            },
            "redemptionEligibility": True,
        },
        "leads": [
            {
                "leadId": "lead-1001",
                "status": "Processing",
                "statusChanged": now_iso(-1),
                "sourceLeadId": "crm-8841",
                "responseCodeDescription": "Клиент ожидает обратного звонка",
            }
        ],
        "credit_catalog": credit_products,
        "credit_offers": [
            {
                "offerId": "offer-001",
                "productId": "loan-individual-001",
                "productName": "Кредит наличными Комфорт",
                "rate": 11.9,
                "amount": 350000,
                "term": 36,
                "status": "Authorised",
            }
        ],
        "credit_applications": [
            {
                "applicationId": "application-001",
                "status": "AwaitingAuthorisation",
                "productName": "Кредитная карта Multi Flex",
                "CustomProduct": {"Amount": {"amount": 120000}},
            }
        ],
        "cash_loan_applications": {},
        "payments": {},
    }


store = LocalBackendStore()
STATE = store.state


app = FastAPI(title="MultiBank Local Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5002",
        "http://127.0.0.1:5002",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_client_id(client_id: Optional[str]) -> str:
    if not client_id:
        return DEFAULT_CLIENT_ID
    return client_id if "-" in client_id else f"{TEAM_ID}-{client_id}"


def get_account(account_id: str) -> Dict[str, Any]:
    for account in STATE["accounts"]:
        if account["accountId"] == account_id or account["id"] == account_id:
            return account
    raise HTTPException(status_code=404, detail="Account not found")


def get_card(card_id: str) -> Dict[str, Any]:
    for cards in STATE["cards"].values():
        for card in cards:
            if card["cardId"] == card_id or card["publicId"] == card_id:
                return card
    raise HTTPException(status_code=404, detail="Card not found")


def account_to_banking_payload(account: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "accountId": account["accountId"],
        "id": account["id"],
        "accountNumber": account["accountNumber"],
        "identification": account["identification"],
        "bank": account["bank"],
        "bankName": account["bankName"],
        "currency": account["currency"],
        "status": account["status"],
        "balance": {"amount": round(account["balance"] / 100, 2), "currency": {"code": account["currency"]}},
        "availableBalance": {"amount": round(account["availableBalance"] / 100, 2), "currency": {"code": account["currency"]}},
    }


def update_bank_balance(bank: str, delta_rub: float) -> None:
    current = STATE["balances"].get(bank, 0.0)
    STATE["balances"][bank] = round(current + delta_rub, 2)
    for account in STATE["accounts"]:
        if account["bank"] == bank:
            account["balance"] = max(0, int(round((STATE["balances"][bank]) * 100)))
            account["availableBalance"] = account["balance"]
    for cards in STATE["cards"].values():
        for card in cards:
            if card["bank"] == bank:
                card["accountBalance"] = max(0, round(STATE["balances"][bank], 2))


def create_general_transaction(
    tx_type: str,
    amount_rub: float,
    bank: str,
    account_id: str,
    description: str,
    direction: str,
    reference: str,
    to_account_number: Optional[str] = None,
) -> Dict[str, Any]:
    tx_id = f"tx-{uuid4().hex[:8]}"
    amount_minor = int(round(amount_rub * 100))
    transaction = {
        "id": tx_id,
        "transactionId": tx_id,
        "accountId": account_id,
        "bank": bank,
        "type": tx_type,
        "status": "completed",
        "currency": "RUB",
        "amount": amount_minor,
        "description": description,
        "reference": reference,
        "createdAt": now_iso(),
        "bookingDateTime": now_iso(),
        "creditDebitIndicator": "Credit" if direction == "in" else "Debit",
        "transactionInformation": description,
        "fromAccount": {"accountNumber": get_account(account_id)["accountNumber"]} if direction == "out" else None,
        "toAccount": {"accountNumber": to_account_number} if to_account_number else None,
    }
    STATE["transactions"].insert(0, transaction)
    return transaction


def as_account_transaction(tx: Dict[str, Any]) -> Dict[str, Any]:
    amount_rub = round(tx["amount"] / 100, 2)
    if tx.get("creditDebitIndicator") == "Debit":
        amount_rub = -amount_rub
    return {
        "transactionId": tx["transactionId"],
        "amount": {"amount": f"{abs(amount_rub):.2f}", "currency": tx["currency"]},
        "creditDebitIndicator": tx.get("creditDebitIndicator", "Debit"),
        "transactionInformation": tx.get("description"),
        "reference": tx.get("reference"),
        "bookingDateTime": tx.get("bookingDateTime"),
    }


def payment_payload(status_code: str, amount: float, description: str, mobile_number: Optional[str] = None) -> Dict[str, Any]:
    commission = round(amount * 0.01, 2)
    total = round(amount + commission, 2)
    payment_id = f"pay-{uuid4().hex[:8]}"
    payload = {
        "id": payment_id,
        "documentId": f"DOC-{payment_id[-6:].upper()}",
        "description": description,
        "paySum": {"amount": amount, "currency": {"code": "RUB"}},
        "commissionSum": {"amount": commission, "currency": {"code": "RUB"}},
        "commission": {"amount": commission, "currency": {"code": "RUB"}},
        "totalSum": {"amount": total, "currency": {"code": "RUB"}},
        "status": {"code": status_code} if isinstance(status_code, str) and "_" in status_code or status_code in {"NEED_CONFIRM", "EXECUTED", "PROCESSING", "REFUSED"} else status_code,
    }
    if mobile_number:
        payload["mobileNumber"] = {"number": mobile_number}
    return payload


def store_payment(kind: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    STATE["payments"][payload["id"]] = {"kind": kind, "payload": copy.deepcopy(payload)}
    return payload


def get_products_payload() -> Dict[str, Any]:
    products = copy.deepcopy(STATE["products"])
    return {"data": {"products": products}, "products": products}


normalize_client_id = store.normalize_client_id
get_account = store.get_account
get_card = store.get_card
account_to_banking_payload = store.account_to_banking_payload
update_bank_balance = store.update_bank_balance
create_general_transaction = store.create_general_transaction
as_account_transaction = store.as_account_transaction
payment_payload = store.payment_payload
store_payment = store.store_payment
get_products_payload = store.get_products_payload


@app.get("/")
async def root() -> Dict[str, str]:
    return {"status": "ok", "message": "MultiBank local backend is running"}


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "service": "local-multibank-backend"}


@app.get("/{client_id}/bank_names")
@app.get("/api/{client_id}/bank_names")
async def bank_names(client_id: str) -> List[str]:
    normalize_client_id(client_id)
    return copy.deepcopy(STATE["connected_banks"])


@app.get("/available_balance/{bank}/{client_id}")
@app.get("/api/available_balance/{bank}/{client_id}")
async def available_balance(bank: str, client_id: str) -> Dict[str, Any]:
    normalize_client_id(client_id)
    return {"bank": bank, "balance": STATE["balances"].get(bank, 0.0)}


@app.post("/payments/make_transfer/")
@app.post("/api/payments/make_transfer/")
async def make_transfer(payload: Dict[str, Any]) -> Dict[str, Any]:
    from_bank = payload.get("from_bank")
    to_bank = payload.get("to_bank")
    amount = float(payload.get("amount", 0))
    if not from_bank or not to_bank or amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid transfer payload")

    update_bank_balance(from_bank, -amount)
    if to_bank in STATE["balances"]:
        update_bank_balance(to_bank, amount)

    source_account = next((a for a in STATE["accounts"] if a["bank"] == from_bank), None)
    target_account = next((a for a in STATE["accounts"] if a["bank"] == to_bank), None)
    if source_account:
        create_general_transaction(
            tx_type="transfer",
            amount_rub=amount,
            bank=from_bank,
            account_id=source_account["accountId"],
            description="Межбанковский перевод",
            direction="out",
            reference="between-banks",
            to_account_number=target_account["accountNumber"] if target_account else None,
        )
    if target_account:
        create_general_transaction(
            tx_type="transfer",
            amount_rub=amount,
            bank=to_bank,
            account_id=target_account["accountId"],
            description="Входящий межбанковский перевод",
            direction="in",
            reference="between-banks",
            to_account_number=target_account["accountNumber"],
        )

    return {"success": True, "message": "Transfer completed locally"}


@app.get("/api/auth/banks")
async def auth_banks() -> Dict[str, Any]:
    return {"banks": list(STATE["banks"].values())}


@app.post("/api/auth/bank-token")
async def auth_bank_token(bank: str = Query(...)) -> Dict[str, str]:
    return {"token": f"local-token-{bank}"}


@app.post("/api/auth/telegram")
async def auth_telegram(payload: Dict[str, Any]) -> Dict[str, Any]:
    init_data = payload.get("initData")
    return {"token": STATE["token"], "user": {**STATE["user"], "telegram_init_data": init_data}}


@app.get("/api/auth/me")
async def auth_me() -> Dict[str, Any]:
    return {"user": copy.deepcopy(STATE["user"])}


@app.post("/api/auth/refresh")
async def auth_refresh() -> Dict[str, str]:
    STATE["token"] = f"local-dev-token-{uuid4().hex[:6]}"
    return {"token": STATE["token"]}


@app.post("/api/auth/logout")
async def auth_logout() -> Dict[str, bool]:
    return {"success": True}


@app.post("/api/auth/pin")
async def auth_pin(payload: Dict[str, Any]) -> Dict[str, bool]:
    STATE["user"]["security"]["pinSet"] = bool(payload.get("pin"))
    return {"success": True}


@app.post("/api/auth/pin/verify")
async def auth_pin_verify(payload: Dict[str, Any]) -> Dict[str, bool]:
    if not payload.get("pin"):
        raise HTTPException(status_code=400, detail="PIN required")
    return {"success": True}


@app.put("/api/users/profile")
async def update_profile(payload: Dict[str, Any]) -> Dict[str, Any]:
    STATE["user"].update(payload)
    return {"user": copy.deepcopy(STATE["user"])}


@app.put("/api/users/preferences")
async def update_preferences(payload: Dict[str, Any]) -> Dict[str, Any]:
    STATE["user"]["preferences"].update(payload)
    return {"preferences": copy.deepcopy(STATE["user"]["preferences"])}


@app.get("/api/users/stats")
async def get_user_stats() -> Dict[str, Any]:
    return {
        "stats": {
            "banksConnected": len(STATE["connected_banks"]),
            "products": len(STATE["products"]),
            "transactions": len(STATE["transactions"]),
        }
    }


@app.delete("/api/users/account")
async def delete_user_account() -> Dict[str, bool]:
    return {"success": True}


@app.get("/api/accounts")
async def get_accounts() -> Dict[str, Any]:
    return {"accounts": copy.deepcopy(STATE["accounts"])}


@app.get("/api/accounts/banking")
async def get_accounts_banking(bank: str = Query("vbank"), client_id: str = Query(DEFAULT_CLIENT_ID)) -> Dict[str, Any]:
    normalize_client_id(client_id)
    accounts = [account_to_banking_payload(a) for a in STATE["accounts"] if a["bank"] == bank]
    return {"data": {"accounts": accounts, "account": accounts}}


@app.get("/api/accounts/{account_id}")
async def get_account_detail(account_id: str) -> Dict[str, Any]:
    return copy.deepcopy(get_account(account_id))


@app.post("/api/accounts")
async def create_account(payload: Dict[str, Any]) -> Dict[str, Any]:
    new_account = {
        "id": f"acc-{uuid4().hex[:8]}",
        "accountId": f"acc-{uuid4().hex[:8]}",
        "bank": payload.get("bank", "vbank"),
        "bankName": payload.get("bankName", "ВТБ"),
        "accountType": payload.get("accountType", "текущий счет"),
        "accountNumber": payload.get("accountNumber", "40702810900000000999"),
        "identification": payload.get("accountNumber", "40702810900000000999"),
        "currency": payload.get("currency", "RUB"),
        "balance": int(payload.get("balance", 0)),
        "availableBalance": int(payload.get("balance", 0)),
        "interestRate": float(payload.get("interestRate", 0)),
        "status": "active",
        "isDefault": False,
        "publicId": payload.get("publicId", f"acc-{uuid4().hex[:8]}"),
    }
    STATE["accounts"].append(new_account)
    return copy.deepcopy(new_account)


@app.put("/api/accounts/{account_id}")
async def update_account(account_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    account = get_account(account_id)
    account.update(payload)
    return copy.deepcopy(account)


@app.put("/api/accounts/{account_id}/default")
async def set_default_account(account_id: str) -> Dict[str, Any]:
    for account in STATE["accounts"]:
        account["isDefault"] = account["accountId"] == account_id or account["id"] == account_id
    return {"success": True}


@app.get("/api/accounts/{account_id}/balance")
async def get_account_balance(account_id: str) -> Dict[str, Any]:
    account = get_account(account_id)
    return {"balance": account["balance"], "availableBalance": account["availableBalance"]}


@app.get("/api/accounts/{account_id}/transactions")
async def get_account_transactions(account_id: str, limit: int = Query(20), page: int = Query(1)) -> Dict[str, Any]:
    account_transactions = [as_account_transaction(tx) for tx in STATE["transactions"] if tx["accountId"] == account_id]
    start = max(0, (page - 1) * limit)
    end = start + limit
    return {"transaction": account_transactions[start:end]}


@app.get("/api/transactions")
async def get_transactions(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(20),
    page: int = Query(1),
) -> Dict[str, Any]:
    items = copy.deepcopy(STATE["transactions"])
    if type:
        items = [tx for tx in items if tx["type"] == type]
    if status:
        items = [tx for tx in items if tx["status"] == status]
    total = len(items)
    start = max(0, (page - 1) * limit)
    end = start + limit
    return {
        "transactions": items[start:end],
        "pagination": {
            "total": total,
            "current": page,
            "pages": max(1, (total + limit - 1) // limit),
        },
    }


@app.get("/api/transactions/{transaction_id}")
async def get_transaction(transaction_id: str) -> Dict[str, Any]:
    for tx in STATE["transactions"]:
        if tx["id"] == transaction_id or tx["transactionId"] == transaction_id:
            return copy.deepcopy(tx)
    raise HTTPException(status_code=404, detail="Transaction not found")


@app.post("/api/transactions/transfer")
async def create_transfer(payload: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(payload.get("amount", 0))
    from_bank = payload.get("from_bank", "vbank")
    to_bank = payload.get("to_bank", "abank")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    update_bank_balance(from_bank, -amount)
    update_bank_balance(to_bank, amount)
    source_account = next((a for a in STATE["accounts"] if a["bank"] == from_bank), None)
    if source_account:
        transaction = create_general_transaction(
            tx_type="transfer",
            amount_rub=amount,
            bank=from_bank,
            account_id=source_account["accountId"],
            description="Перевод между банками",
            direction="out",
            reference="api-transfer",
        )
        return {"transaction": transaction}
    return {"success": True}


@app.get("/api/transactions/stats/summary")
async def get_transactions_summary() -> Dict[str, Any]:
    income = sum(tx["amount"] for tx in STATE["transactions"] if tx["type"] == "deposit")
    expense = sum(tx["amount"] for tx in STATE["transactions"] if tx["type"] in {"withdrawal", "payment", "transfer"})
    return {"income": income, "expense": expense}


@app.post("/api/consents/accounts")
@app.post("/api/consents/payments")
@app.post("/api/consents/product-agreements")
async def create_consent(_: Dict[str, Any]) -> Dict[str, Any]:
    return {"consentId": f"consent-{uuid4().hex[:8]}", "status": "approved"}


@app.get("/api/consents/accounts/{consent_id}")
@app.get("/api/consents/payments/{consent_id}")
@app.get("/api/consents/product-agreements/{consent_id}")
async def get_consent(consent_id: str) -> Dict[str, Any]:
    return {"consentId": consent_id, "status": "approved"}


@app.delete("/api/consents/accounts/{consent_id}")
@app.delete("/api/consents/payments/{consent_id}")
@app.delete("/api/consents/product-agreements/{consent_id}")
async def delete_consent(consent_id: str) -> Dict[str, Any]:
    return {"consentId": consent_id, "revoked": True}


@app.post("/api/payments")
async def create_account_payment(payload: Dict[str, Any]) -> Dict[str, Any]:
    initiation = payload.get("data", {}).get("initiation", {})
    amount = float(initiation.get("instructedAmount", {}).get("amount", 0))
    debtor = initiation.get("debtorAccount", {}).get("identification", "")
    creditor = initiation.get("creditorAccount", {}).get("identification", "")
    source_account = next((a for a in STATE["accounts"] if a["accountNumber"] == debtor), None)
    if source_account and amount > 0:
        update_bank_balance(source_account["bank"], -amount)
        create_general_transaction(
            tx_type="transfer",
            amount_rub=amount,
            bank=source_account["bank"],
            account_id=source_account["accountId"],
            description=initiation.get("comment", "Перевод по номеру счета"),
            direction="out",
            reference="account-transfer",
            to_account_number=creditor,
        )
    payment = store_payment("account", payment_payload("EXECUTED", amount, "Перевод по номеру счета"))
    return {"payment": payment}


@app.get("/api/payments/{payment_id}")
async def get_account_payment(payment_id: str) -> Dict[str, Any]:
    payment = STATE["payments"].get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"payment": copy.deepcopy(payment["payload"])}


@app.get("/api/telegram/webapp-config")
async def telegram_config() -> Dict[str, Any]:
    return {"ok": True, "theme": "light"}


@app.post("/api/telegram/verify-webapp")
async def telegram_verify(_: Dict[str, Any]) -> Dict[str, Any]:
    return {"verified": True}


@app.get("/api/rewards/balance/{external_account_id}")
async def rewards_balance(external_account_id: str) -> Dict[str, Any]:
    if external_account_id != STATE["rewards"]["externalAccountID"]:
        raise HTTPException(status_code=404, detail="Rewards account not found")
    return copy.deepcopy(STATE["rewards"])


@app.post("/api/rewards/redeem/{external_account_id}")
async def rewards_redeem(external_account_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if external_account_id != STATE["rewards"]["externalAccountID"]:
        raise HTTPException(status_code=404, detail="Rewards account not found")
    amount = int(float(payload.get("data", {}).get("redemptionAmount", 0)))
    available = STATE["rewards"]["rewardSummary"]["availableBalance"]
    if amount <= 0 or amount > available:
        raise HTTPException(status_code=400, detail="Not enough points")
    STATE["rewards"]["rewardSummary"]["availableBalance"] -= amount
    return {"success": True, "remainingBalance": STATE["rewards"]["rewardSummary"]["availableBalance"]}


@app.get("/api/products")
async def get_products(client_id: str = Query(DEFAULT_CLIENT_ID)) -> Dict[str, Any]:
    normalize_client_id(client_id)
    return get_products_payload()


@app.get("/api/products/{product_id}")
async def get_product(product_id: str) -> Dict[str, Any]:
    for product in STATE["products"]:
        if product["agreement_id"] == product_id:
            return copy.deepcopy(product)
    raise HTTPException(status_code=404, detail="Product not found")


@app.get("/api/products/agreements")
async def get_agreements() -> Dict[str, Any]:
    return {"agreements": copy.deepcopy(STATE["products"])}


@app.post("/api/products/agreements")
async def create_agreement(payload: Dict[str, Any]) -> Dict[str, Any]:
    agreement = {"agreementId": f"agr-{uuid4().hex[:8]}", **payload}
    return agreement


@app.get("/api/products/agreements/{agreement_id}")
async def get_agreement(agreement_id: str) -> Dict[str, Any]:
    return {"agreementId": agreement_id}


@app.delete("/api/products/agreements/{agreement_id}")
async def close_agreement(agreement_id: str) -> Dict[str, Any]:
    return {"agreementId": agreement_id, "closed": True}


@app.get("/api/leads")
async def get_leads_status(leadId: Optional[List[str]] = Query(None)) -> Dict[str, Any]:
    if not leadId:
        return {"leads": []}
    lead_ids = set(leadId)
    leads = [lead for lead in STATE["leads"] if lead["leadId"] in lead_ids]
    return {"leads": copy.deepcopy(leads)}


@app.post("/api/leads")
async def add_leads(payload: Dict[str, Any]) -> Dict[str, Any]:
    created = []
    for lead in payload.get("leads", []):
        item = {
            "leadId": f"lead-{uuid4().hex[:6]}",
            "status": "New",
            "statusChanged": now_iso(),
            "sourceLeadId": lead.get("sourceLeadId"),
            "responseCodeDescription": "Лид зарегистрирован локальным контуром",
        }
        STATE["leads"].insert(0, item)
        created.append(item)
    return {"leads": created}


@app.post("/api/leads/check")
async def check_leads(payload: Dict[str, Any]) -> Dict[str, Any]:
    leads = []
    for lead in payload.get("leads", []):
        positive = str(lead.get("inn", "")).endswith(("2", "4", "6", "8"))
        leads.append(
            {
                "responseCode": "POSITIVE" if positive else "NEGATIVE",
                "responseCodeDescription": "Лид соответствует базовым правилам" if positive else "ИНН не прошел локальную валидацию",
            }
        )
    return {"leads": leads}


@app.get("/api/credit-products/products")
async def credit_products() -> Dict[str, Any]:
    return {"Data": {"Product": copy.deepcopy(STATE["credit_catalog"])}}


@app.get("/api/credit-products/products/{product_id}")
async def credit_product_detail(product_id: str) -> Dict[str, Any]:
    for product in STATE["credit_catalog"]:
        if product["productId"] == product_id:
            return {"Data": {"Product": copy.deepcopy(product)}}
    raise HTTPException(status_code=404, detail="Credit product not found")


@app.post("/api/credit-products/customer-leads")
async def credit_customer_lead(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"customerLeadId": f"cust-lead-{uuid4().hex[:6]}", **payload}


@app.get("/api/credit-products/customer-leads/{customer_lead_id}")
async def credit_customer_lead_get(customer_lead_id: str) -> Dict[str, Any]:
    return {"customerLeadId": customer_lead_id, "status": "Processing"}


@app.delete("/api/credit-products/customer-leads/{customer_lead_id}")
async def credit_customer_lead_delete(customer_lead_id: str) -> Dict[str, Any]:
    return {"customerLeadId": customer_lead_id, "deleted": True}


@app.post("/api/credit-products/product-offers")
async def credit_offer_create(payload: Dict[str, Any]) -> Dict[str, Any]:
    offer = {"offerId": f"offer-{uuid4().hex[:6]}", **payload}
    STATE["credit_offers"].insert(0, offer)
    return offer


@app.get("/api/credit-products/product-offers")
async def credit_offers() -> Dict[str, Any]:
    return {"Data": {"ProductOffers": copy.deepcopy(STATE["credit_offers"])}}


@app.get("/api/credit-products/product-offers/{offer_id}")
async def credit_offer_detail(offer_id: str) -> Dict[str, Any]:
    for offer in STATE["credit_offers"]:
        if offer["offerId"] == offer_id:
            return {"Data": {"ProductOffer": copy.deepcopy(offer)}}
    raise HTTPException(status_code=404, detail="Offer not found")


@app.delete("/api/credit-products/product-offers/{offer_id}")
async def credit_offer_delete(offer_id: str) -> Dict[str, Any]:
    return {"offerId": offer_id, "deleted": True}


@app.post("/api/credit-products/product-offer-consents")
async def credit_offer_consent_create(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"consentId": f"offer-consent-{uuid4().hex[:6]}", **payload}


@app.get("/api/credit-products/product-offer-consents/{consent_id}")
async def credit_offer_consent_get(consent_id: str) -> Dict[str, Any]:
    return {"consentId": consent_id, "status": "Authorised"}


@app.delete("/api/credit-products/product-offer-consents/{consent_id}")
async def credit_offer_consent_delete(consent_id: str) -> Dict[str, Any]:
    return {"consentId": consent_id, "deleted": True}


@app.post("/api/credit-products/product-application")
async def credit_application_create(payload: Dict[str, Any]) -> Dict[str, Any]:
    application = {
        "applicationId": f"application-{uuid4().hex[:6]}",
        "status": "AwaitingAuthorisation",
        **payload,
    }
    STATE["credit_applications"].insert(0, application)
    return application


@app.get("/api/credit-products/product-application")
async def credit_applications() -> Dict[str, Any]:
    return {"Data": {"ProductApplication": copy.deepcopy(STATE["credit_applications"])}}


@app.get("/api/credit-products/product-application/{application_id}")
async def credit_application_detail(application_id: str) -> Dict[str, Any]:
    for application in STATE["credit_applications"]:
        if application["applicationId"] == application_id:
            return {"Data": {"ProductApplication": copy.deepcopy(application)}}
    raise HTTPException(status_code=404, detail="Application not found")


@app.delete("/api/credit-products/product-application/{application_id}")
async def credit_application_delete(application_id: str) -> Dict[str, Any]:
    return {"applicationId": application_id, "deleted": True}


@app.post("/api/cash-loan-applications")
async def cash_loan_create(payload: Dict[str, Any]) -> Dict[str, Any]:
    application_id = str(uuid4())
    application = {
        "applicationId": application_id,
        "status": "PRE_APPROVED",
        "requestedAmount": payload.get("cashLoanProduct", {}).get("creditAmount", 0),
        "term": payload.get("cashLoanProduct", {}).get("creditPeriod", 0),
    }
    STATE["cash_loan_applications"][application_id] = application
    return copy.deepcopy(application)


@app.get("/api/cash-loan-applications/{application_id}")
async def cash_loan_status(application_id: str) -> Dict[str, Any]:
    application = STATE["cash_loan_applications"].get(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return copy.deepcopy(application)


@app.patch("/api/cash-loan-applications/{application_id}/confirm")
async def cash_loan_confirm(application_id: str) -> Dict[str, Any]:
    application = STATE["cash_loan_applications"].get(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application["status"] = "PROCESSING"
    return copy.deepcopy(application)


@app.get("/api/cards")
async def get_cards(bank: str = Query("vbank"), client_id: Optional[str] = Query(None)) -> Dict[str, Any]:
    normalize_client_id(client_id)
    cards = copy.deepcopy(STATE["cards"].get(bank, []))
    return {"data": {"cards": cards}, "meta": {"source": "local-backend", "bank": bank}}


@app.get("/api/cards/{card_id}")
async def get_card_details(
    card_id: str,
    bank: str = Query("vbank"),
    client_id: Optional[str] = Query(None),
    show_full_number: bool = Query(False),
) -> Dict[str, Any]:
    normalize_client_id(client_id)
    card = copy.deepcopy(get_card(card_id))
    if not show_full_number:
        card["cardNumberFull"] = card["cardNumber"]
    return card


@app.get("/api/card-management/cvv/{public_id}")
async def get_card_cvv(public_id: str) -> Dict[str, Any]:
    get_card(public_id)
    return {"cvv": "123"}


@app.post("/api/card-management/token/{public_id}")
async def tokenize_card(public_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    get_card(public_id)
    return {"token": {"tokenId": f"tok-{uuid4().hex[:8]}", "publicId": public_id, "payload": payload}}


@app.get("/api/card-management/tokens/{public_id}")
async def get_card_tokens(public_id: str) -> Dict[str, Any]:
    get_card(public_id)
    return {
        "tokens": [
            {"tokenId": f"tok-{public_id}-iphone", "deviceName": "iPhone 15", "status": "ACTIVE"},
            {"tokenId": f"tok-{public_id}-watch", "deviceName": "Apple Watch", "status": "ACTIVE"},
        ]
    }


@app.get("/api/cards/{card_id}/statement")
async def get_card_statement(card_id: str, bank: str = Query("vbank"), client_id: Optional[str] = Query(None)) -> Response:
    normalize_client_id(client_id)
    get_card(card_id)
    content = base64.b64decode(pdf_base64(f"Statement {bank.upper()} {card_id}"))
    return Response(content=content, media_type="application/pdf")


@app.post("/api/card-operations/close/{public_id}")
async def close_card(public_id: str) -> Dict[str, Any]:
    card = get_card(public_id)
    card["status"] = "CLOSED"
    return {"success": True, "status": "CLOSED"}


@app.post("/api/card-operations/pin/{public_id}")
async def change_card_pin(public_id: str, _: Dict[str, Any]) -> Dict[str, Any]:
    get_card(public_id)
    return {"success": True}


@app.put("/api/card-operations/status/{public_id}")
async def change_card_status(public_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    card = get_card(public_id)
    new_status = payload.get("newStatus", "ACTIVE")
    for cards in STATE["cards"].values():
        for item in cards:
            if item["publicId"] == public_id or item["cardId"] == public_id:
                item["status"] = new_status
    card["status"] = new_status
    return {"success": True, "status": new_status}


@app.get("/api/universal-payments/products")
async def universal_products() -> Dict[str, Any]:
    accounts = [{"account": {"publicId": account["publicId"], "currency": account["currency"]}} for account in STATE["accounts"]]
    cards = [{"card": {"publicId": card["publicId"], "currency": "RUB"}} for cards_list in STATE["cards"].values() for card in cards_list]
    return {"accounts": accounts, "cards": cards}


@app.post("/api/universal-payments/payments/start")
async def universal_start(payload: Dict[str, Any]) -> Dict[str, Any]:
    service_id = payload.get("providerService", {}).get("id", "")
    dictionary_items = [
        {"key": "moscow", "value": "Москва"},
        {"key": "spb", "value": "Санкт-Петербург"},
    ]
    return {
        "fields": [
            {
                "key": "payerCode",
                "name": "Лицевой счет",
                "type": "TEXT",
                "required": True,
                "description": f"Введите идентификатор для услуги {service_id or 'поставщика'}",
            },
            {
                "key": "region",
                "name": "Регион",
                "type": "DICTIONARY",
                "required": True,
                "dictionaryField": {"items": dictionary_items},
            },
        ],
        "paySum": {
            "payLimit": {"min": {"amount": 100}, "max": {"amount": 50000}},
            "recommendedSums": [
                {"amount": 500, "currency": {"code": "RUB"}},
                {"amount": 1000, "currency": {"code": "RUB"}},
                {"amount": 2500, "currency": {"code": "RUB"}},
            ],
        },
    }


@app.post("/api/universal-payments/payments/request")
async def universal_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(payload.get("paySum", {}).get("amount", 0))
    payment = store_payment(
        "universal",
        {
            **payment_payload("NEED_CONFIRM", amount, "Универсальный платеж"),
            "status": {"code": "NEED_CONFIRM"},
        },
    )
    return {"payment": payment}


@app.post("/api/universal-payments/payments/confirm")
async def universal_confirm(payload: Dict[str, Any]) -> Dict[str, Any]:
    payment_id = payload.get("paymentId")
    payment_state = STATE["payments"].get(payment_id)
    if not payment_state:
        raise HTTPException(status_code=404, detail="Payment not found")
    purpose = payload.get("clientConfirm", {}).get("confirmPurpose")
    payment = payment_state["payload"]
    if purpose == "REQUEST_CODE":
        payment["status"] = {"code": "NEED_CONFIRM"}
    else:
        payment["status"] = {"code": "EXECUTED"}
    return {"payment": copy.deepcopy(payment)}


@app.get("/api/universal-payments/payments/{payment_id}")
async def universal_get(payment_id: str) -> Dict[str, Any]:
    payment_state = STATE["payments"].get(payment_id)
    if not payment_state:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"payment": copy.deepcopy(payment_state["payload"])}


@app.get("/api/universal-payments/payments/{payment_id}/check")
async def universal_check(payment_id: str) -> Dict[str, Any]:
    if payment_id not in STATE["payments"]:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"pdf": pdf_base64(f"Universal payment {payment_id}")}


@app.post("/api/mobile-payments/products")
async def mobile_products(_: Dict[str, Any]) -> Dict[str, Any]:
    accounts = [
        {
            "publicId": account["publicId"],
            "balance": {"amount": round(account["balance"] / 100, 2), "currency": {"code": account["currency"]}},
        }
        for account in STATE["accounts"]
    ]
    cards = [
        {
            "publicId": card["publicId"],
            "balance": {"amount": round(card["accountBalance"], 2), "currency": {"code": "RUB"}},
        }
        for cards_list in STATE["cards"].values()
        for card in cards_list
    ]
    return {"accounts": accounts, "cards": cards}


@app.post("/api/mobile-payments/phones/info")
async def mobile_phone_info(payload: Dict[str, Any]) -> Dict[str, Any]:
    number = payload.get("number", "")
    providers = {
        "79": {"id": "mts", "name": "МТС"},
        "78": {"id": "megafon", "name": "МегаФон"},
        "77": {"id": "beeline", "name": "Билайн"},
    }
    provider = providers.get(number[:2], {"id": "tele2", "name": "Tele2"})
    return {
        "number": number,
        "serviceProvider": provider,
        "paymentOptions": {
            "paySumLimit": {
                "minSum": {"amount": 100, "currency": {"code": "RUB"}},
                "maxSum": {"amount": 5000, "currency": {"code": "RUB"}},
            },
            "recommendedSums": [
                {"amount": 200, "currency": {"code": "RUB"}},
                {"amount": 500, "currency": {"code": "RUB"}},
                {"amount": 1000, "currency": {"code": "RUB"}},
            ],
        },
    }


@app.post("/api/mobile-payments/payments/start")
async def mobile_start(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"success": True, "request": payload}


@app.post("/api/mobile-payments/payments/request")
async def mobile_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(payload.get("paySum", {}).get("amount", 0))
    mobile_number = payload.get("mobileNumber", {}).get("number")
    payment = store_payment(
        "mobile",
        {
            **payment_payload("PROCESSING", amount, "Пополнение мобильной связи", mobile_number=mobile_number),
            "status": "PROCESSING",
        },
    )
    return {"payment": payment}


@app.post("/api/mobile-payments/payments/confirm")
async def mobile_confirm(payload: Dict[str, Any]) -> Dict[str, Any]:
    payment_id = payload.get("id")
    payment_state = STATE["payments"].get(payment_id)
    if not payment_state:
        raise HTTPException(status_code=404, detail="Payment not found")
    purpose = payload.get("clientApprove", {}).get("purpose")
    payment = payment_state["payload"]
    if purpose == "REQUEST_CODE":
        payment["status"] = "PROCESSING"
    else:
        payment["status"] = "EXECUTED"
    return {"payment": copy.deepcopy(payment)}


@app.get("/api/mobile-payments/payments/{payment_id}")
async def mobile_get(payment_id: str) -> Dict[str, Any]:
    payment_state = STATE["payments"].get(payment_id)
    if not payment_state:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"payment": copy.deepcopy(payment_state["payload"])}


@app.get("/api/mobile-payments/payments/{payment_id}/check")
async def mobile_check(payment_id: str) -> Dict[str, Any]:
    if payment_id not in STATE["payments"]:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"pdf": pdf_base64(f"Mobile payment {payment_id}")}
