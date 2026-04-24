# MultiBank Local Architecture

## Product Model

MultiBank is modeled as a single customer workspace that aggregates data from several banks into one consistent financial profile.

Core entities:

- `Customer`
  Holds identity, preferences, security settings, and a stable `clientId`.
- `ConnectedBank`
  Describes a bank integrated into the customer workspace.
- `Account`
  A banking account inside a конкретный bank.
- `Card`
  A payment instrument linked to an account.
- `Transaction`
  A normalized movement of money across all banks.
- `Product`
  Deposit, loan, savings, credit card, insurance or reward program object.
- `Consent`
  A permission boundary for account access, payments, and product operations.
- `Lead`
  A sales or application intent initiated inside the multibank UI.
- `Payment`
  A payment flow with lifecycle: start -> request -> confirm -> receipt.

## How The System Should Work

### 1. Aggregation Layer

The app should not think in terms of separate external bank APIs on each page.
Pages should read from one normalized backend contract:

- `/accounts`
- `/cards`
- `/transactions`
- `/products`
- `/payments`
- `/rewards`
- `/leads`

The backend is responsible for mapping raw bank-specific formats into one stable UI model.

### 2. Bank Connection Flow

Each bank connection should have these states:

- `discovered`
- `requested`
- `connected`
- `restricted`
- `revoked`

When a bank is connected, the backend stores:

- bank identity
- consent status
- last sync time
- available products
- balances
- cards
- transaction snapshot

### 3. Unified Financial Profile

For each customer, backend builds:

- total balance across all banks
- balances per bank
- primary card per bank
- deposits and loans across the portfolio
- monthly income/expense summary
- reward balances
- available payment products

This unified profile is what powers dashboard, cards, analytics, rewards, credits and planning.

### 4. Payments

Payments in multibank should use one shared lifecycle:

1. `start`
   Backend returns service metadata, limits, required fields and recommended amounts.
2. `request`
   Backend validates payer product, creates payment draft and returns confirmation requirement.
3. `confirm`
   Backend processes code request or final confirmation.
4. `receipt`
   Backend generates a downloadable receipt.

This flow should work одинаково for:

- account-to-account transfers
- provider payments
- mobile top-ups

### 5. Budget Planning / Savings

Planning should operate on top of a dedicated internal savings ledger:

- source of funds: connected bank accounts/cards
- destination: `savings_account`
- operations: top up, distribute by plans, reserve for goals

Budget planning is not a separate fake feature. It should be a real layer on top of:

- current balances
- savings balance
- plan allocations
- goals
- joint goals

### 6. Credit Domain

Credit domain should be split into:

- existing customer loans from connected banks
- marketplace offers
- applications
- cash-loan flow

Important rule:
existing obligations and new offers are different products, but share one normalized risk and repayment view in UI.

### 7. Rewards

Rewards should be modeled as a portfolio-level loyalty module:

- current points/cashback balance
- catalogs of redemption
- eligibility rules
- redemption history

## Why Local Backend Is Better Here

The repo now uses a local backend contour as the source of truth for development.
This gives:

- stable frontend contracts
- deterministic demo data
- no dependency on third-party API availability
- one place to evolve the multibank data model
- easier transition later to real bank adapters behind the same endpoints

## Backend Layout

The local backend is now split by responsibility:

- `server/src/main.py`
  Thin entrypoint for ASGI startup.
- `server/src/local_backend/api.py`
  FastAPI routes and HTTP contract.
- `server/src/local_backend/seed.py`
  Seeded demo customer, banks, accounts, cards, products and payments.
- `server/src/local_backend/store.py`
  In-memory domain state and shared backend operations.

## Recommended Next Step

If the project continues, split the backend into three layers:

1. `domain`
   Customer, bank, account, card, transaction, product, payment models.
2. `adapters`
   Real bank connectors and mock/local providers.
3. `api`
   Stable UI-facing endpoints used by the frontend.

That will let the app switch between local mode and real integration mode without rewriting pages.
