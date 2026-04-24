from __future__ import annotations

import copy
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import HTTPException

from .seed import DEFAULT_CLIENT_ID, TEAM_ID, now_iso, seed_state


class LocalBackendStore:
    def __init__(self) -> None:
        self.state = seed_state()

    def normalize_client_id(self, client_id: Optional[str]) -> str:
        if not client_id:
            return DEFAULT_CLIENT_ID
        return client_id if "-" in client_id else f"{TEAM_ID}-{client_id}"

    def get_account(self, account_id: str) -> Dict[str, Any]:
        for account in self.state["accounts"]:
            if account["accountId"] == account_id or account["id"] == account_id:
                return account
        raise HTTPException(status_code=404, detail="Account not found")

    def get_card(self, card_id: str) -> Dict[str, Any]:
        for cards in self.state["cards"].values():
            for card in cards:
                if card["cardId"] == card_id or card["publicId"] == card_id:
                    return card
        raise HTTPException(status_code=404, detail="Card not found")

    def account_to_banking_payload(self, account: Dict[str, Any]) -> Dict[str, Any]:
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

    def update_bank_balance(self, bank: str, delta_rub: float) -> None:
        current = self.state["balances"].get(bank, 0.0)
        self.state["balances"][bank] = round(current + delta_rub, 2)
        for account in self.state["accounts"]:
            if account["bank"] == bank:
                account["balance"] = max(0, int(round(self.state["balances"][bank] * 100)))
                account["availableBalance"] = account["balance"]
        for cards in self.state["cards"].values():
            for card in cards:
                if card["bank"] == bank:
                    card["accountBalance"] = max(0, round(self.state["balances"][bank], 2))

    def create_general_transaction(
        self,
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
            "fromAccount": {"accountNumber": self.get_account(account_id)["accountNumber"]} if direction == "out" else None,
            "toAccount": {"accountNumber": to_account_number} if to_account_number else None,
        }
        self.state["transactions"].insert(0, transaction)
        return transaction

    def as_account_transaction(self, tx: Dict[str, Any]) -> Dict[str, Any]:
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

    def payment_payload(self, status_code: str, amount: float, description: str, mobile_number: Optional[str] = None) -> Dict[str, Any]:
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
            "status": {"code": status_code}
            if isinstance(status_code, str) and "_" in status_code or status_code in {"NEED_CONFIRM", "EXECUTED", "PROCESSING", "REFUSED"}
            else status_code,
        }
        if mobile_number:
            payload["mobileNumber"] = {"number": mobile_number}
        return payload

    def store_payment(self, kind: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        self.state["payments"][payload["id"]] = {"kind": kind, "payload": copy.deepcopy(payload)}
        return payload

    def get_products_payload(self) -> Dict[str, Any]:
        products = copy.deepcopy(self.state["products"])
        return {"data": {"products": products}, "products": products}

