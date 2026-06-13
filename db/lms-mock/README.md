# Local LMS Mock PostgreSQL

This folder contains local-only SQL for simulating AlphaCampus/LMS readonly views.

It is not a PS Track owned schema and must not be treated as an operational LMS migration.

Run it through Docker Compose:

```bash
docker compose --profile lms up -d lms-postgres
```

The app can then use:

```text
LMS_PROVIDER=readonly-db
LMS_DATABASE_URL=postgresql://lms_readonly:lms_readonly_password@lms-postgres:5432/lms_mock
```

The mock database exposes:

- `lms_content_catalog_view`
- `lms_learning_record_view`

`lms_readonly` receives `SELECT` on these views only. The local owner user is `lms_mock_owner`.
