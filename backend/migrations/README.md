# Migrations

SQL migrations managed by `sqlx-cli`. Create one with:

```sh
sqlx migrate add -r <name>   # run from backend/
```

Rules: expand–contract only; no locking migrations on `tips` during business hours.
