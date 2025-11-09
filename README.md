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
- A 

## Notes on Data Privacy and Security

In the design of our systems, we employ a low trust model and strive to minimize the data stored by this software. All storage solutions support full encryption at rest. In addition to passwords, we also hash emails and recovery tokens. For more information, read more [about Privacy and Security.](./SECURITY.md)

## Roadmap

- Further Cleanup
- Further Security Audits

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
