# Environment Variables

Environment variables are read once at startup.

Values are trimmed of surrounding whitespace. Unset variables fall back to the defaults listed below, and required integrations log a warning when a value is missing. Boolean variables accept `true`, `1`, `yes`, and `on` as enabled, and `false`, `0`, `no`, and `off` as disabled (case-insensitive). An invalid boolean logs an error and uses the default.

> IMPORTANT:
> For production, do **not** keep database encryption keys in a `.env` file. See [SECURITY.md](./SECURITY.md#database-security) for the recommended approach.

For the logo and consent texts referenced by `APP_LOGO` and used at registration, see [Configuration Directory](./configuration.md).

## Application

| Variable   | Config key         | Default                 | Description                                                                                                                                                                                                                                   |
| ---------- | ------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_NAME` | `APPLICATION_NAME` | `Unnamed Application`   | Public application name. Used in page titles, emails, the OIDC provider metadata, and as the TOTP issuer.                                                                                                                                     |
| `APP_LOGO` | `APPLICATION_LOGO` | `app-logo.jpeg`         | File name **relative to `configuration/`**. The code prepends `configuration/`, so `APP_LOGO=my-logo.png` resolves to `configuration/my-logo.png`. Used as the email logo attachment. See [Configuration Directory](./configuration.md#logo). |
| `BASE_URL` | `BASE_URL`         | `http://localhost:3000` | Absolute URL the app is served from. Used for the OIDC issuer, OIDC callback, redirects, invite/recovery links, and email links. Must be a valid URL. Logs a warning when unset.                                                              |
| `PORT`     | `PORT`             | `3000`                  | TCP port the Express server listens on.                                                                                                                                                                                                       |

Examples:

```dotenv
APP_NAME=Aktivistio Accounts
APP_LOGO=app-logo.jpeg
BASE_URL=https://accounts.example.org
PORT=3000
```

## Rate limiting

All limiters use `rate-limiter-flexible`'s in-memory store. Counters are kept in RAM and are lost on restart; no IP addresses are written to disk.

| Variable                              | Config key                                  | Default | Window / block | Keyed by                 | Description                                                                      |
| ------------------------------------- | ------------------------------------------- | ------- | -------------- | ------------------------ | -------------------------------------------------------------------------------- |
| `USE_GLOBAL_PROTECTION_RATE_LIMITER`  | `RATE_LIMITER.USE_GLOBAL_PROTECTION`        | `false` | —              | —                        | Enables the global per-IP limiter for every request. Set to `true` to enable it. |
| `RATE_LIMIT_GLOBAL_ATTEMPTS`          | `RATE_LIMITER.MAX_GLOBAL_ATTEMPTS`          | `3000`  | 1 h / 1 h      | IP                       | Requests allowed per IP per hour when global protection is enabled.              |
| `RATE_LIMIT_LOGIN_COUNT`              | `RATE_LIMITER.MAX_LOGIN_ATTEMPTS`           | `20`    | 1 h / 1 h      | IP + username            | Login and password-recovery attempts per IP and username.                        |
| `RATE_LIMIT_TWOFACTOR_ATTEMPTS`       | `RATE_LIMITER.MAX_TWOFACTOR_ATTEMPTS`       | `10`    | 1 h / 1 h      | Session's 2FA account ID | Two-factor code attempts per login session.                                      |
| `RATE_LIMIT_REGISTER_INVITE_ATTEMPTS` | `RATE_LIMITER.MAX_REGISTER_INVITE_ATTEMPTS` | `200`   | 2 h / 2 h      | IP                       | Registration, invite, and welcome requests per IP.                               |

> The window and block durations are fixed in `src/middlewares/rate-limiter.middlewares.js`; only the point counts are configurable.

## Secure context and reverse proxy

| Variable          | Config key          | Default | Description                                                                                                                                                               |
| ----------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IS_SECURE`       | `IS_SECURE_CONTEXT` | `false` | Marks the app as running over HTTPS. Enables the `secure` flag on the session cookie, CSRF cookie, and cookie-parser cookie. Set this to `true` in production.            |
| `IS_BEHIND_PROXY` | `IS_BEHIND_PROXY`   | `false` | Trusts a reverse proxy. Enables Express session's `proxy` option and `provider.proxy` for the OIDC provider, so client IPs and protocol are read from forwarding headers. |

> Set both variables to `true` in production when the application is served over HTTPS, directly or through a reverse proxy. They can be set to `false` or omitted otherwise.

## Invite email whitelist

| Variable                     | Config key                   | Default | Description                                                                                                                                                                                                                         |
| ---------------------------- | ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WHITELISTED_MAIL_PROVIDERS` | `WHITELISTED_MAIL_PROVIDERS` | `[]`    | Comma-separated list of email domains allowed for **invite requests** (for example `example.org,example.com`). Whitespace around entries is trimmed. An empty or unset list applies no host restriction. Logs a warning when unset. |

```dotenv
WHITELISTED_MAIL_PROVIDERS=example.org,example.com
```

This list only affects the invite-request form validation. It does not restrict addresses used elsewhere, such as user recovery email addresses.

## Database and debugging

| Variable                  | Config key                | Default | Description                                                                                                                                                                                 |
| ------------------------- | ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEBUG_DATABASE`          | `DEBUG_DATABASE`          | `false` | Uses an in-memory SQLite database for every store (`:memory:`) instead of files under `data/`. Backups and backup cleanup are skipped. **All data is lost on restart.** Development only.   |
| `USE_DATABASE_ENCRYPTION` | `DATABASE_ENCRYPTION.USE` | `false` | Encrypts databases with the configured keys. When enabled but a key is missing, a message is logged and that database is opened **without** encryption. The launcher forces this to `true`. |

When `DEBUG_DATABASE` is enabled, every start is treated as a fresh database. This also re-runs the initial superadmin bootstrap on each start (see [`SUPERADMIN_DEFAULT_PASSWORD`](#defaults-and-superadmin-bootstrap)).

### Encryption keys

| Variable                | Config key                          | Used for                                           |
| ----------------------- | ----------------------------------- | -------------------------------------------------- |
| `DATABASE_KEY_DATA`     | `DATABASE_ENCRYPTION.KEYS.DATA`     | Main application data database (`data/<name>.db`). |
| `DATABASE_KEY_OIDC`     | `DATABASE_ENCRYPTION.KEYS.OIDC`     | OIDC adapter database (clients, grants, tokens).   |
| `DATABASE_KEY_SECRETS`  | `DATABASE_ENCRYPTION.KEYS.SECRETS`  | Secret storage database.                           |
| `DATABASE_KEY_SESSIONS` | `DATABASE_ENCRYPTION.KEYS.SESSIONS` | Session database.                                  |

These variables have **no defaults** and are `undefined` when unset. They are required when `USE_DATABASE_ENCRYPTION` is enabled. Keys must be non-empty and must be preserved across restarts; changing a key makes the existing database unreadable.

## Database backups

| Variable                         | Config key                        | Default     | Description                                                                                                                              |
| -------------------------------- | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `DO_DATABASE_BACKUPS`            | `DATABASE_BACKUPS.DO`             | `true`      | Enables scheduled backups. Backups are also skipped when `NODE_ENV=test` or `DEBUG_DATABASE` is enabled. Set to `false` to disable them. |
| `DATABASE_BACKUP_CRON`           | `DATABASE_BACKUPS.CRON`           | `0 0 * * *` | Cron expression for the backup job. The default runs daily at midnight.                                                                  |
| `DATABASE_BACKUP_RETENTION_DAYS` | `DATABASE_BACKUPS.RETENTION_DAYS` | `4`         | Age in days after which backups in `./backups/` are deleted.                                                                             |

Backups are written to `./backups/<name>-backup-<timestamp>.db`. A backup is skipped if the database file does not exist or if a SQLite journal file is present.

Set `DO_DATABASE_BACKUPS=false` to disable scheduled backups.

## Mail

Mail is sent through Nodemailer. The transport is created at startup, but a missing configuration usually surfaces when the first email is sent (for example invites or account recovery).

| Variable                   | Config key                 | Default               | Description                                                                                                        |
| -------------------------- | -------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `MAIL_HOST`                | `MAIL.HOST`                | — (none)              | SMTP server hostname. Logs a warning when unset.                                                                   |
| `MAIL_USER`                | `MAIL.USER`                | — (none)              | SMTP username. Also used as the sender address in the `From` header. Logs a warning when unset.                    |
| `MAIL_PASS`                | `MAIL.PASS`                | — (none)              | SMTP password. Logs a warning when unset.                                                                          |
| `MAIL_SECURE`              | `MAIL.SECURE`              | `true`                | Use implicit TLS immediately after connecting. Typically `true` for port 465 and `false` for STARTTLS on port 587. |
| `MAIL_PORT`                | `MAIL.PORT`                | `465`                 | SMTP port.                                                                                                         |
| `MAIL_SENDER_DISPLAY_NAME` | `MAIL.SENDER_DISPLAY_NAME` | `Unnamed Application` | Display name used in the `From` header. Logs a warning when unset.                                                 |

```dotenv
MAIL_HOST=mail.example.org
MAIL_USER=accounts@example.org
MAIL_PASS=change-me
MAIL_SECURE=true
MAIL_PORT=465
MAIL_SENDER_DISPLAY_NAME=Example Accounts
```

## Defaults and superadmin bootstrap

| Variable                      | Config key                    | Default | Description                                                                                                                                                                                                   |
| ----------------------------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPERADMIN_DEFAULT_PASSWORD` | `DEFAULT.SUPERADMIN_PASSWORD` | `null`  | Password for the `admin` superadmin created **only when the main data database is first initialized**. When unset, a random password is generated. In both cases the password is printed to the console once. |

This variable has no effect after the data database exists. To rotate the admin password, change it through the application rather than relying on this variable.

## Monitoring

| Variable                | Config key              | Default | Description                                                                                                                               |
| ----------------------- | ----------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `MONITOR_LOG_REGULARLY` | `MONITOR.LOG_REGULARLY` | `true`  | Logs a status line (uptime, Express state, memory, event-loop lag) 5 seconds after startup and then hourly. Set to `false` to disable it. |
| `MONITOR_LAG`           | `MONITOR.MONITOR_LAG`   | `true`  | Enables the event-loop delay histogram used in the status line. Set to `false` to disable it.                                             |

Both variables default to `true`. Set them to `false` to disable the corresponding monitoring behavior.

## Launcher

| Variable       | Config key     | Default | Description                                                                                                                                                                                           |
| -------------- | -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USE_LAUNCHER` | `USE_LAUNCHER` | `false` | Indicates that the app was started by `src/launcher.js`. Enables the launcher-specific UI in the dashboard (key slots). The launcher sets this automatically, so normally you do not set it yourself. |

When running through the launcher, it also sets `USE_DATABASE_ENCRYPTION=true` in the child process and supplies the four `DATABASE_KEY_*` values after they are unlocked remotely. See [SECURITY.md](./SECURITY.md#launcher-with-remote-unlock).

## Complete example

Development example without encryption keys:

```dotenv
# Application
APP_NAME=Example Accounts
APP_LOGO=app-logo.jpeg
BASE_URL=http://localhost:3000
PORT=3000

# Cookies and proxy
IS_SECURE=false
IS_BEHIND_PROXY=false

# Rate limiting (omit to keep the global limiter off)
USE_GLOBAL_PROTECTION_RATE_LIMITER=true
RATE_LIMIT_GLOBAL_ATTEMPTS=3000
RATE_LIMIT_LOGIN_COUNT=20
RATE_LIMIT_TWOFACTOR_ATTEMPTS=10
RATE_LIMIT_REGISTER_INVITE_ATTEMPTS=200

# Invite requests
WHITELISTED_MAIL_PROVIDERS=example.org,example.com

# Database
DEBUG_DATABASE=false
USE_DATABASE_ENCRYPTION=false
# DATABASE_KEY_DATA=...
# DATABASE_KEY_OIDC=...
# DATABASE_KEY_SECRETS=...
# DATABASE_KEY_SESSIONS=...

# Backups
DO_DATABASE_BACKUPS=true
DATABASE_BACKUP_CRON=0 0 * * *
DATABASE_BACKUP_RETENTION_DAYS=4

# Mail
MAIL_HOST=mail.example.org
MAIL_USER=accounts@example.org
MAIL_PASS=change-me
MAIL_SECURE=true
MAIL_PORT=465
MAIL_SENDER_DISPLAY_NAME=Example Accounts

# Bootstrap (first run only)
SUPERADMIN_DEFAULT_PASSWORD=change-me

# Monitoring
MONITOR_LOG_REGULARLY=true
MONITOR_LAG=true
```

For production, supply the `DATABASE_KEY_*` values through your secret manager or the launcher, set `BASE_URL` to the public HTTPS URL, and enable `IS_SECURE` and `IS_BEHIND_PROXY` as appropriate.

## Related documentation

- [Configuration Directory](./configuration-dir.md) — logo and consent texts under `configuration/`
- [Security and Privacy Overview](./SECURITY.md) — database encryption, launcher, and data handling
