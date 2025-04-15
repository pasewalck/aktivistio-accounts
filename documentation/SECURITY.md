# Security and Privacy Overview

The goal of our design was to strike a good balance between security and usability.

Data Minimization: In the design of our systems, we use a low trust model. We try to minimize data stored on the end of this software.

## Database Security

All databases used for storing account, session, OIDC, and more support full encryption at rest. We utilize [better-sqlite3-multiple-ciphers](https://github.com/m4heshd/better-sqlite3-multiple-ciphers) for this.

The encryption key should be supplied through the environment and must be securely passed into this environment. Using something like an .env file would undermine security and make the encryption basically obsolete. We recommend using trusted and secure key management software.

By using fully encrypted databases, data stored within these databases are protected against attackers gaining access to the database files.

## Password Security Enforcement

Passwords supplied by users are tested using [zxcvbn](https://github.com/dropbox/zxcvbn), which is an advanced password strength estimator. Its design is inspired by the inner workings of password crackers and prioritizes difficulty to crack over arbitrary rules that do not actually improve security.

## User Account Recovery

We allow accounts to be recovered in two ways: email and recovery token. Users can choose to use both, either, or neither for their account.

### Balance of Security and Usability

From a security standpoint, we recommend recovery tokens, as this prevents email account compromise from being used to maliciously recover the account. However, we understand that security tokens can be messy and overwhelming, which is why we allow both methods. While we generally don't recommend enabling both at the same time, we do not prohibit it.

## Two-Factor Authentication

Alongside passwords, we allow the optional use of two-factor authentication. Currently, only TOTP tokens are available as an option; however, we are considering adding support for more two-factor options.

## Readability of Tokens

A common issue with long, complex tokens is that when written down on paper, some characters might be misread, making it impossible to use the token later on. To combat this, we strip tokens of any letters and numbers that have similarities in appearance. One example is the number "1" and the letter "I".

## Hashing Almost Everything

Along with hashing passwords with random salts, which is standard practice, we also hash tokens and emails used for account recovery. Additionally, emails used for invite requests are hashed.

This security practice prevents attackers or malicious parties with control over the decrypted user data from gaining access to emails, which might contain sensitive data or link the user to an identity or other accounts.

We also considered hashing usernames; however, this does not prove practical, as usernames will be passed to OIDC clients and will be exposed that way.

## Additional Privacy Measures

**No Trackers:** The system currently has zero trackers to enhance user privacy.

**Logging System:** No active file-based logging system is implemented. Future plans may include a basic audit log with auto-deleting functionality.

## OIDC Claims

Concerning OIDC Claims, we only provide the user ID (a random string), the username (specified by the user), and an email. However, this email IS NOT the email provided by the user for account recovery; that email is hashed and thus would be and is useless! Instead, we return an imaginary email.

## Invite Codes

Invite codes are generally linked to an account; however, accounts created with these invites are not linked to these invites or the account associated with the invite code.

### Future Considerations:
- Potential to implement optional features for linking accounts created to the accounts that supplied the invite code used for creation.
- Certain user roles may generate invites not linked to their accounts.
