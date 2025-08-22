
# Limitless Web — dynamic (Cloudflare Pages + D1)

**Zero zmian wizualnych.** Dodano backend na Functions oraz panel pod `/admin`.

## Szybki start (Cloudflare Pages)

1) **Nowy projekt Pages** → `Connect to Git` albo **Upload** folderu `your-project/`.
2) W **Project Settings → Functions**:
   - Bind D1: `DB` → wybierz lub utwórz bazę (D1).
   - (Opcjonalnie) Ustaw **Environment variables**: `ADMIN_USER`, `ADMIN_PASS`, `ADMIN_SECRET`.
3) Deploy.

## Lokalnie (opcjonalnie)

```bash
npm i -g wrangler
wrangler d1 create limitless_web_db
# Zaktualizuj database_id w wrangler.toml -> d1_databases[0].database_id
wrangler d1 execute limitless_web_db --local --file=./migrations/0001_init.sql
wrangler pages dev ./public -- local
```

## Endpoints

- `POST /api/quotes` — zapis zgłoszenia (wywoływane przez formularz).
- `GET /admin/data` — lista zgłoszeń (wymaga ciasteczka sesji).
- `POST /api/login` — logowanie (domyślnie 123 / 123).
- `POST /api/logout` — wylogowanie.
- `GET /api/health` — healthcheck.

## Panel

- UI: `/admin/login.html` (logowanie), `/admin/` (lista).
- Dane ładowane przez `/admin/data`.

## Schemat bazy

Tabela `quotes` (z indeksami). Migracja: `migrations/0001_init.sql`.

## Uwaga o bezpieczeństwie

- Hasła trzymaj jako **Environment Variables**.
- Ciasteczko `session` jest `HttpOnly; SameSite=Strict; Secure`.
- Panel nie jest linkowany z nawigacji — wejście tylko przez `/admin`.

