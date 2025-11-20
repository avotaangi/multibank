# import requests, json

# url = "http://127.0.0.1:8000/api/accounts/acc-2051/transactions"
# params = {
#     "bank": "vbank",
#     "client_id": "1",
#     "page": 1,
#     "limit": 50
# }
# headers = {
#     "accept": "application/json",
#     "X-Consent-Id": "consent-7266cd1d2eb5"
# }

# response = requests.get(url, params=params, headers=headers)

# response = response.json()

# result = response.get("data").get("transaction")

# for transaction in result:
#     print(transaction.get("transactionInformation"))

# _--------------------------------------------------------------------------------------

# TRANSACTION_KEYWORDS = {
#     "ReceivedCreditTransfer": {
#         "default": [
#             "Перевод от",
#             "Входящий перевод из"
#         ],
#         "salary": [
#             "Зарплата"
#         ]
#     },

#     "IssuedDebitTransfer": {
#         # исходящие переводы
#         "default": [
#             "Межбанковский перевод в",
#             "Перевод на",
#             "Межбанковский перевод",   # расширенный вариант
#             "Перевод по номеру счета"  # встречался у тебя в списке
#         ],

#         # продукты, магазины
#         "foodstuff": [
#             "Пятёрочка",
#             "Магнит",
#             "Дикси",
#             "Ашан",
#             "Перекрёсток",
#             "Лента",
#             "ВкусВилл",
#             "Спар", "SPAR"            # логично добавить
#         ],

#         # развлечения и кафе
#         "entertainments": [
#             "Coffee House",
#             "Кофе Хаус",
#             "Starbucks",
#             "KFC",
#             "Шоколадница",
#             "Сбарро",
#             "Макдоналдс",
#             "McDonalds",
#             "Бургер Кинг",
#             "Burger King"
#         ],

#         # транспорт
#         "transport": [
#             "Транспорт",
#             "Метро",
#             "Автобус",
#             "МЦД",
#             "МЦК",
#             "Такси"
#         ],

#         # одежда и торговые центры
#         "shopping": [
#             "H&M",
#             "Zara",
#             "ZARA",
#             "Uniqlo",
#             "Pull&Bear",
#             "Стокманн"
#         ]
#     }
# }


# --------------------------------------------------------------------------------------------------------------------------------




# import requests
# import re

# bank_name = "sbank"
# base_url = "open.bankingapi.ru"
# access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZWFtMDk2IiwiY2xpZW50X2lkIjoidGVhbTA5NiIsInR5cGUiOiJ0ZWFtIiwiaXNzIjoiYWJhbmsiLCJhdWQiOiJvcGVuYmFua2luZyIsImV4cCI6MTc2MzY1OTcyMX0.u0N5I4dNXL-RVDuoBnbAvHrU2sa6BQkHfpz4dSR5V6I"        # подставь свой
# client_id = "team096"                # твой CLIENT_ID
# client_id_id = "1"                   # id клиента

# url = f"https://{bank_name}.{base_url}/account-consents/request"

# headers = {
#     "Authorization": f"Bearer {access_token}",
#     "X-Requesting-Bank": client_id,
#     "Content-Type": "application/json"
# }

# data = {
#     "client_id": f"{client_id}-{client_id_id}",
#     "permissions": [
#         "ReadAccountsDetail",
#         "ReadBalances",
#         "ReadTransactionsDetail",
#         "ReadCards"
#     ],
#     "reason": "Агрегация счетов для HackAPI",
#     "requesting_bank": client_id,
#     "requesting_bank_name": re.sub(r"([a-zA-Z]+)(\d+)", r"\1 \2 App", client_id)
# }

# response = requests.post(url, headers=headers, json=data, timeout=15)

# print("Status:", response.status_code)
# print("Response:", response.text)





# --------------------------------------------------------------------------------------------------------------------------------

import requests
import re

bank_name = "vbank"
base_url = "open.bankingapi.ru"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZWFtMDk2IiwiY2xpZW50X2lkIjoidGVhbTA5NiIsInR5cGUiOiJ0ZWFtIiwiaXNzIjoidmJhbmsiLCJhdWQiOiJvcGVuYmFua2luZyIsImV4cCI6MTc2MzcwMzc3Nn0.cbxwYbcouaQcbi5CzWTscP-5T0DmnqyGesJCvWfCmHE"        # подставь свой
client_id = "team096"                # твой CLIENT_ID
client_id_id = "6"                   # id клиента
request_id = "req-cfa416d15da7"

url = f"https://{bank_name}.{base_url}/account-consents/{request_id}"

resp = requests.get(url, headers={
    "Authorization": f"Bearer {access_token}",
    "X-Requesting-Bank": client_id
})

print(resp.json())
