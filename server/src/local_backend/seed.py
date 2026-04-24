from __future__ import annotations

import base64
from datetime import datetime, timedelta
from typing import Any, Dict


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
        {
            "id": "tx-006",
            "transactionId": "tx-006",
            "accountId": "acc-vbank-main",
            "bank": "vbank",
            "type": "payment",
            "status": "completed",
            "currency": "RUB",
            "amount": 45900,
            "description": "Оплата мобильной связи",
            "reference": "mobile-topup",
            "createdAt": now_iso(-1),
            "bookingDateTime": now_iso(-1),
            "creditDebitIndicator": "Debit",
            "transactionInformation": "Оплата мобильной связи",
            "fromAccount": {"accountNumber": "40702810900000000001"},
            "toAccount": {"accountNumber": "40817810099910004312"},
        },
        {
            "id": "tx-007",
            "transactionId": "tx-007",
            "accountId": "acc-abank-main",
            "bank": "abank",
            "type": "deposit",
            "status": "completed",
            "currency": "RUB",
            "amount": 98000,
            "description": "Перевод в накопления",
            "reference": "savings-topup",
            "createdAt": now_iso(-7),
            "bookingDateTime": now_iso(-7),
            "creditDebitIndicator": "Credit",
            "transactionInformation": "Перевод в накопления",
            "fromAccount": None,
            "toAccount": {"accountNumber": "40702810100000000002"},
        },
        {
            "id": "tx-008",
            "transactionId": "tx-008",
            "accountId": "acc-sbank-main",
            "bank": "sbank",
            "type": "payment",
            "status": "completed",
            "currency": "RUB",
            "amount": 126500,
            "description": "Оплата ЖКХ",
            "reference": "utilities-payment",
            "createdAt": now_iso(-6),
            "bookingDateTime": now_iso(-6),
            "creditDebitIndicator": "Debit",
            "transactionInformation": "Оплата ЖКХ",
            "fromAccount": {"accountNumber": "40702810300000000003"},
            "toAccount": {"accountNumber": "40702810000000999999"},
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
        {
            "productId": "refinance-001",
            "productName": "Рефинансирование Портфель",
            "productType": "refinance",
            "interestRate": 10.5,
            "minAmount": 100000,
            "maxAmount": 5000000,
            "minTerm": 12,
            "maxTerm": 96,
            "description": "Объединение кредитов в один платеж",
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
            "vbank": {"id": "vbank", "name": "ВТБ", "url": "http://localhost:8005/local/vbank"},
            "abank": {"id": "abank", "name": "Альфа-Банк", "url": "http://localhost:8005/local/abank"},
            "sbank": {"id": "sbank", "name": "Сбербанк", "url": "http://localhost:8005/local/sbank"},
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
            {
                "id": "acc-vbank-savings",
                "accountId": "acc-vbank-savings",
                "bank": "vbank",
                "bankName": "ВТБ",
                "accountType": "накопительный счет",
                "accountNumber": "40702810900000000011",
                "identification": "40702810900000000011",
                "currency": "RUB",
                "balance": 26450000,
                "availableBalance": 26450000,
                "interestRate": 9.2,
                "status": "active",
                "isDefault": False,
                "publicId": "acc-vbank-savings",
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
                    "paymentSystem": "Mastercard",
                    "cvv": "731",
                    "tokens": ["Apple Pay", "Mir Pay"],
                    "statementBase64": pdf_base64("Выписка по карте ВТБ Platinum"),
                },
                {
                    "cardId": "vbank-card-2",
                    "publicId": "vbank-card-2",
                    "bank": "vbank",
                    "cardName": "ВТБ Virtual",
                    "cardNumber": "2201 **** **** 1155",
                    "cardNumberFull": "2201123412341155",
                    "maskedPan": "2201 **** **** 1155",
                    "pan": "2201123412341155",
                    "accountId": "acc-vbank-savings",
                    "accountNumber": "40702810900000000011",
                    "accountBalance": 264500.00,
                    "status": "ACTIVE",
                    "expiryDate": "08/30",
                    "paymentSystem": "Mir",
                    "cvv": "184",
                    "tokens": ["Mir Pay"],
                    "statementBase64": pdf_base64("Выписка по виртуальной карте ВТБ"),
                }
            ],
            "abank": [
                {
                    "cardId": "abank-card-1",
                    "publicId": "abank-card-1",
                    "bank": "abank",
                    "cardName": "Альфа-Карта",
                    "cardNumber": "3568 **** **** 8362",
                    "cardNumberFull": "3568123412348362",
                    "maskedPan": "3568 **** **** 8362",
                    "pan": "3568123412348362",
                    "accountId": "acc-abank-main",
                    "accountNumber": "40702810100000000002",
                    "accountBalance": 92340.10,
                    "status": "ACTIVE",
                    "expiryDate": "09/27",
                    "paymentSystem": "Visa",
                    "cvv": "415",
                    "tokens": ["Google Pay"],
                    "statementBase64": pdf_base64("Выписка по карте Альфа-Банк"),
                }
            ],
            "sbank": [
                {
                    "cardId": "sbank-card-1",
                    "publicId": "sbank-card-1",
                    "bank": "sbank",
                    "cardName": "СберКарта",
                    "cardNumber": "6352 **** **** 3923",
                    "cardNumberFull": "6352123412343923",
                    "maskedPan": "6352 **** **** 3923",
                    "pan": "6352123412343923",
                    "accountId": "acc-sbank-main",
                    "accountNumber": "40702810300000000003",
                    "accountBalance": 148220.87,
                    "status": "ACTIVE",
                    "expiryDate": "03/29",
                    "paymentSystem": "Mir",
                    "cvv": "982",
                    "tokens": [],
                    "statementBase64": pdf_base64("Выписка по карте Сбербанк"),
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
            {
                "agreement_id": "dep-sbank-001",
                "bank": "sbank",
                "product_type": "deposit",
                "product_name": "Подушка безопасности",
                "status": "active",
                "amount": 95000.00,
                "agreement_details": {
                    "data": {
                        "product_name": "Подушка безопасности",
                        "amount": 95000.00,
                        "interest_rate": 7.8,
                        "status": "active",
                        "start_date": now_iso(-20)[:10],
                        "maturity_date": now_iso(240)[:10],
                    }
                },
            },
        ],
        "rewards": {
            "externalAccountID": "card-vbank-001",
            "rewardSummary": {
                "rewardType": "POINTS",
                "currencyCode": "PTS",
                "availableBalance": 18420,
                "availableAmount": 18420,
                "rewardAmount": 18420,
                "availablePoints": 18420,
            },
            "programDetail": {
                "programId": "loyalty-multibank",
                "description": "Единая программа лояльности по всем подключенным банкам",
                "catalogs": [
                    {
                        "catalogId": "travel",
                        "name": "Путешествия",
                        "catalogType": "TRAVEL",
                        "description": "Компенсация билетов и отелей",
                        "conversionRate": 1,
                        "minRedeemPoints": 500,
                        "maxRedeemPoints": 15000,
                    },
                    {
                        "catalogId": "cashback",
                        "name": "Рубли на счет",
                        "catalogType": "CASH",
                        "description": "Конвертация бонусов в рубли",
                        "conversionRate": 1,
                        "minRedeemPoints": 1000,
                        "maxRedeemPoints": 10000,
                    },
                    {
                        "catalogId": "marketplace",
                        "name": "Маркетплейс",
                        "catalogType": "GOODS",
                        "description": "Покупки у партнеров",
                        "conversionRate": 1,
                        "minRedeemPoints": 300,
                        "maxRedeemPoints": 7000,
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
            },
            {
                "leadId": "lead-1002",
                "status": "Approved",
                "statusChanged": now_iso(-3),
                "sourceLeadId": "crm-7720",
                "responseCodeDescription": "Одобрено открытие накопительного продукта",
            },
        ],
        "consents": {
            "accounts": {
                "consent-accounts-001": {
                    "consentId": "consent-accounts-001",
                    "status": "approved",
                    "scope": "accounts.read",
                }
            },
            "payments": {
                "consent-payments-001": {
                    "consentId": "consent-payments-001",
                    "status": "approved",
                    "scope": "payments.execute",
                }
            },
            "product-agreements": {
                "consent-products-001": {
                    "consentId": "consent-products-001",
                    "status": "approved",
                    "scope": "products.manage",
                }
            },
        },
        "credit_catalog": credit_products,
        "credit_leads": [
            {
                "customerLeadId": "credit-lead-001",
                "status": "approved",
                "productType": "loanIndividual",
                "requestedAmount": 400000,
            },
            {
                "customerLeadId": "credit-lead-002",
                "status": "processing",
                "productType": "refinance",
                "requestedAmount": 780000,
            },
        ],
        "credit_offers": [
            {
                "offerId": "offer-001",
                "productId": "loan-individual-001",
                "productName": "Кредит наличными Комфорт",
                "rate": 11.9,
                "amount": 350000,
                "term": 36,
                "status": "Authorised",
            },
            {
                "offerId": "offer-002",
                "productId": "refinance-001",
                "productName": "Рефинансирование Портфель",
                "rate": 10.2,
                "amount": 820000,
                "term": 60,
                "status": "Authorised",
            },
        ],
        "credit_applications": [
            {
                "applicationId": "application-001",
                "status": "AwaitingAuthorisation",
                "productName": "Кредитная карта Multi Flex",
                "CustomProduct": {"Amount": {"amount": 120000}},
            },
            {
                "applicationId": "application-002",
                "status": "Approved",
                "productName": "Кредит наличными Комфорт",
                "CustomProduct": {"Amount": {"amount": 350000}},
            },
        ],
        "cash_loan_applications": {
            "cash-application-001": {
                "applicationId": "cash-application-001",
                "status": "confirmed",
                "partnerName": "multibank",
                "creditAmount": 250000,
                "creditPeriod": 24,
                "createdAt": now_iso(-2),
            }
        },
        "payments": {
            "pay-demo-001": {
                "kind": "utility",
                "payload": {
                    "id": "pay-demo-001",
                    "documentId": "DOC-DEMO01",
                    "description": "Оплата ЖКХ",
                    "paySum": {"amount": 3250.0, "currency": {"code": "RUB"}},
                    "commissionSum": {"amount": 32.5, "currency": {"code": "RUB"}},
                    "commission": {"amount": 32.5, "currency": {"code": "RUB"}},
                    "totalSum": {"amount": 3282.5, "currency": {"code": "RUB"}},
                    "status": {"code": "EXECUTED"},
                },
            },
            "pay-demo-002": {
                "kind": "mobile",
                "payload": {
                    "id": "pay-demo-002",
                    "documentId": "DOC-DEMO02",
                    "description": "Пополнение мобильного",
                    "mobileNumber": {"number": "+79990001122"},
                    "paySum": {"amount": 950.0, "currency": {"code": "RUB"}},
                    "commissionSum": {"amount": 9.5, "currency": {"code": "RUB"}},
                    "commission": {"amount": 9.5, "currency": {"code": "RUB"}},
                    "totalSum": {"amount": 959.5, "currency": {"code": "RUB"}},
                    "status": {"code": "NEED_CONFIRM"},
                },
            },
        },
    }
