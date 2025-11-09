1. users {
    bank_name: [
        {"client_id_id": str, "consent": str, "account_id", "bank_account_number": str}
    ]
}

2. bank_names {    
    "bank_name": str
}

3. access_tokens {    
    "bank_name": str,
    "access_token": str,
    "updated_at": date
}

4. global_users {
    user_id_id: {
        "bank_names": [ "vbank", "abank", ... ]
    }
}