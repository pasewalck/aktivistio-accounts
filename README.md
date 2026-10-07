# Aktivistio Accounts

The project **Aktivistio Accounts** implements an account system and management platform combined with an OAuth 2.0 Authorization Server.

This project heavily relies on the [node-oidc-provider](https://github.com/panva/node-oidc-provider) module for OAuth 2.0 functionality.

This project was designed and is maintained by Aktivistek. It is used in their aktivismus.org ecosystem.

You might wonder: **Why this and not Keycloak (and alike projects)?**

Keycloak and many alike projects provide an amazing and open-source identity and access management system. The reason we decided to write our own software that does similar things is that software out there was missing key features such as invite codes and the desired user recovery system. By writing our own software, we were able to implement (somewhat specific) features the way we wanted and needed.

## ⚠️ Important Notice

We do not recommend using this project for your own use at the time being. This project is currently in active development. We are still awaiting further code and security reviews.

## Implemented Specs & Features

- OAuth 2.0 Authorization Server using [node-oidc-provider](https://github.com/panva/node-oidc-provider)
- Fully encrypted backend database stores using [better-sqlite3-multiple-ciphers](https://github.com/m4heshd/better-sqlite3-multiple-ciphers)
- Accounts featuring:
    - User Recovery System
    - Two-Factor Authentication (2FA)
    - Invite Codes (Notable Features: Multi-use and Expiration)
    - User Roles and Permissions
- Service Management: Manage OIDC client details
- Secret Storage (Implements rotating secrets for enhanced security)
- User Interface: A UI with basic admin features for user and service (OIDC clients) management.

## Special Features

- No JS Needed on Frontend: Everything in this app works without a single line of JS on the frontend needing to be allowed. No React.js, only a few non-essential lines of vanilla JS.
- Hashing User Emails: Emails provided by users are hashed and never saved to disk in plain text.
- Encryption At Rest: Every single peace of user and service data supports to be encrypted on rest.
- No IP Address is saved to Disk: This app is incapable of saving any IP address to disk, it is simply not implemented. Rate monitoring and blocking uses ram to save any IPs temporarily.
- Data Minimization: This application does not support keeping any non-essential user data (an exception is audit logging of user activity).
- Flexible User Recovery: Recovery of users works via email and via a recovery token. A user can choose either, both or none.

## Additional Notes on Data Privacy and Security

In the design of our systems, we employ a low trust model and strive to minimize the data stored by this software. All storage solutions support full encryption at rest. In addition to passwords, we also hash emails and recovery tokens. For more information, read more [about Privacy and Security.](./documentation/SECURITY.md)

## Roadmap

- Further Cleanup
- Fixing numerous smaller quirks
    - to be elaborated on ...
- Further Security Audits

## Setup

Note: Default credentials will be printed to the console on the initial run.

Also make sure to provide the following environment variables:

- IS_SECURE = (true in production else false)
- IS_BEHIND_PROXY = (true if running behind a proxy (very likely the case))
- BASE_URL = (the base URL the app is served at)

Note that when running with the launcher, you will need to go to /unlock and enter the password supplied to you on first run. Also note that this encryption at rest password is not changeable currently; this is subject to change, however.

### Run with Node Directly

- Make sure to have node.js and pnpm setup.
- Install the packages: `pnpm install`.
- Create "data" and "configuration" directory in project root.
- Run in development:
    - Either run the server directly in development mode: `pnpm run development-server`.
    - Or run with the launcher in development mode: `pnpm run development-launcher` (recommended).
- Run in production:
    1. Run `pnpm run build`.
    2. Run `pnpm run production`.

### Run with Docker

tba.

## Documentation

Further documentation for all features and setup processes is planned.

For any questions or contributions, please reach out to: pasewalck@posteo.net

## Credits

- Icons used are from https://www.svgrepo.com
- Thanks to the great Documentations at https://github.com/panva/node-oidc-provider
- Thanks to the people who have audited the code so far
