# Testing Documentation

## Expected Functionalities:

1) Primary Account Actions
        - **Expected Outcome**: Users should be able to log in successfully using their registered email and password.
    - Register with Invite Code
        - **Expected Outcome**: Users should be able to register for an account using a valid invite code.
    - Delete Account (Self)
        - **Expected Outcome**: Users should be able to delete their own accounts successfully.

2) Password and Recovery Management/Actions
    - Change Password
        - **Expected Outcome**: Users should be able to change their password successfully.
    - Add Recovery Email
        - **Expected Outcome**: Users should be able to add a recovery email to their account.
    - Add Recovery Token
        - **Expected Outcome**: Users should be able to add a recovery token to their account.
    - Use Recovery Token
        - **Expected Outcome**: Users should be able to use their recovery token to regain access to their account (reset password and remove 2fa).
    - Use Recovery Email
        - **Expected Outcome**: Users should be able to use their recovery email to regain access to their account (reset password and remove 2fa).
    - Remove Token Recovery Method
            - **Expected Outcome**: Users should be able to remove the recovery token method from their account.
    - Remove Email Recovery Method
            - **Expected Outcome**: Users should be able to remove the recovery email method from their account.

3) Two-Factor Authentication (2FA) Actions
    - Add 2FA
            - **Expected Outcome**: Users should be able to enable two-factor authentication for their account.
    - Remove 2FA
            - **Expected Outcome**: Users should be able to disable two-factor authentication for their account.
    - Use 2FA for Login
            - **Expected Outcome**: Users should be able to log in using two-factor authentication.

4) Invite Actions
    - Generate Invites (if User Has Permission)
        - **Expected Outcome**: Users with the appropriate permissions should be able to generate new invites.
    - Delete Invites (if User Has Permission)
        - **Expected Outcome**: Users with the appropriate permissions should be able to delete existing invites.
    - Copy Invites
        - **Expected Outcome**: Users should be able to copy invite codes for sharing.
    - Share Invites
        - **Expected Outcome**: Users should be able to share invite codes with others.

- 3. Admin Actions (if User Has Permission (is Admin))
    - Add Services
        - **Expected Outcome**: Admin users should be able to add new services to the system.
    - Manage Services
        - **Expected Outcome**: Admin users should be able to manage existing services, including updating details.
    - Delete Services
        - **Expected Outcome**: Admin users should be able to delete services from the system.
    - Delete Accounts
        - **Expected Outcome**: Admin users should be able to delete user accounts as needed.
