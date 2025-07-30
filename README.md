# Aktivistio Accounts

The project **Aktivistio Accounts** implements an account system and management platform combined with an OAuth 2.0 Authorization Server.

This project heavily relies on the [node-oidc-provider](https://github.com/panva/node-oidc-provider) module for OAuth 2.0 functionality.

This project was designed and is maintained by Aktivistek. It is used in their aktivismus.org ecosystem.

You might wonder: **Why this and not Keycloak?**

Keycloak provides an amazing and open-source identity and access management system. The reason we decided to write our own software that does similar things is that Keycloak was missing key features such as invite codes and the desired user recovery system. By writing our own software, we were able to implement (somewhat specific) features the way we wanted and needed.

## ⚠️ Important Notice

This project is currently in development and is not yet ready for production use. We are still awaiting code and security reviews.

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
- User Interface: A modern UI with basic admin features for user and service (OIDC clients) management.

## Notes on Data Privacy and Security

In the design of our systems, we employ a low trust model and strive to minimize the data stored by this software. All storage solutions support full encryption at rest. In addition to passwords, we also hash emails and recovery tokens. For more information, read more [about Privacy and Security.](https://0xacab.org/aktivistek/aktivistio-accounts/-/blob/master/documentation/SECURITY.md)

## Roadmap

- Add brute force protection
- Conduct more security audits.
- Check all localized fields for spelling and consistency.
- Document environment variables.
- Create a Docker image.

## Setup

Simply run the script.

### Run with Node Directly 
- Install npm packages: ```npm install```
- Run server directly in development mode: ```npm run development-server```
- Run launcher in development mode: ```npm run development-launcher```
- Run  in production mode: ```npm run production```

## Documentation

Further documentation for all features and setup processes is planned.

For any questions or contributions, please reach out to Jana via: jana.c@systemli.org
