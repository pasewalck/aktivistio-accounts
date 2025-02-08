# Aktivistio Accounts

The project **Aktivistio Accounts** implements an account system and management platform combined with an OAuth 2.0 Authorization Server.

This project heavily relies on the [node-oidc-provider](https://github.com/panva/node-oidc-provider) module for OAuth 2.0 functionality.

This project was designed and is maintained by Aktivistio. It is used in their aktivismus.org ecosystem.

You might wonder: **Why this and not keycloak?**

Keycloak provides an amazing and open-source identity and access management system. The reason we decided to write our own software that does similar things is that Keycloak was missing key features such as invite codes and the desired user recovery system. By writing our own software, we were able to implement (somewhat specific) features the way we wanted and needed.

## !!Not ready for production!!

**We are still in Beta**: This project is not ready for production. A security audit and additional review are advisable before we are sure anybody should feel good using it.

## Implemented specs & features

- OAuth 2.0 Authorization Server using [node-oidc-provider](https://github.com/panva/node-oidc-provider)
- Fully encrypted backend Database using [better-sqlite3-multiple-ciphers](https://github.com/m4heshd/better-sqlite3-multiple-ciphers)
- Account Driver including:
    - Recovery System
    - 2fa
    - invite codes
    - user roles
- Somewhat modern User Interface (happy for improvements)
- ...

## Data privacy and security

By using a fully encrypted database, user and session data stored within this database are protected against attackers getting hold of the database files.

Users are able to use both an email and a recovery token to enable recovery for their account. **The email used for this is hashed before saved to** the database. This prevents unwanted access to it by administrators or malicious parties who get hold of the decrypted database. Passwords and recovery tokens are all, of course, also hashed.

Our system includes 0 trackers and, at the time being, does not have an active files based logging system implemented. However, in the future we might add an option for a basic audit log with appropriate auto-deleting functionality.

Concerning OIDC Claims, we only provide the user ID (a random string), the username (specified by the user) and an email. However, this email IS NOT the email provided by the user for account recovery; that email is hashed and so would be and is useless! Instead, we return an imaginary email.

Invite codes are generally linked to an account; however, accounts created with them are not linked to them or the account associated with the invite code. However, it might be valid to implement this as an optional feature. Note: Certain user roles will be able to generate invites not linked to their account.

## Roadmap

- Config Rewrite! Support for encrypted config file. At the moment all session secrets and database keys are stored in plaintext within the config.json file. This defeats the point of an encrypted database!
- (optinal) Rewrite how OIDC clients are loaded. Add support for dynamic clients.
- Get a docker image going.
- Run security audits
- Fix any bugs or issues that come up
- Take a break

## Setup

Simply run the script. Most config varaibles will be auto generated. However make sure to configure email and oidc clients in the config file. See example.config for details!

### Run with node directly 
- Install npm packages: ```npm install```
- Run development: ```npm run development```
- Run production: ```npm run production```

## Documentation

It might be a good idea to write detailed documentation for everything; :) however, that is also a TODO.