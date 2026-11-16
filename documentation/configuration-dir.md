# Configuration Directory

The `configuration/` directory holds deployment-specific assets used by the application: the logo and the consent texts shown during registration. Paths are resolved relative to the project root, so the application must be started from there.

The directory is excluded from version control (`configuration/*` in `.gitignore`), so its contents must be provisioned for each deployment. For the environment variable that selects the logo, see [Environment Variables](./environment.md).

At startup, the application logs a warning for each configured logo or consent file that is missing. The warning does not stop the application, but the affected consent page or outgoing email will fail when it is used.

## Files

| File            | Role                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app-logo.jpeg` | Default application logo. Referenced when `APP_LOGO` is unset. The resulting path (`configuration/app-logo.jpeg`) is passed to views and attached to outgoing emails with a content ID so it renders inline. Replace this file or point `APP_LOGO` at another file in this directory. |
| `en.consent.md` | English consent / privacy notice shown on the registration and account-setup consent page. Markdown is converted to HTML with `marked` before rendering.                                                                                                                              |
| `de.consent.md` | German consent / privacy notice, used for the German locale.                                                                                                                                                                                                                          |

A complete setup looks like this:

```text
configuration/
├── app-logo.jpeg
├── en.consent.md
└── de.consent.md
```

## Logo

The application builds the logo path as `configuration/` plus the value of `APP_LOGO`. The variable defaults to `app-logo.jpeg`, so the default path is `configuration/app-logo.jpeg`.

To use a different file, place it in `configuration/` and set the **file name only**:

```dotenv
APP_LOGO=my-logo.png
```

This resolves to `configuration/my-logo.png`. Do not include the `configuration/` prefix in `APP_LOGO`; it is added automatically.

The logo is attached to outgoing emails and exposed to templates as `app.logo`. The file must exist when an email is sent. Use a reasonably small image so messages remain lightweight.

## Consent texts

The consent page reads `configuration/<locale>.consent.md`, where `<locale>` is the active i18n locale. The application currently supports `en` and `de` (configured in `src/app.js`), so both files must exist. Deleting one causes a file-read error when that locale's consent page is opened. To add another locale, add it to the i18n configuration and provide a matching `<locale>.consent.md` file.

Each file is plain Markdown and is rendered as HTML, so headings, lists, bold text, and links work. The default texts are examples from the aktivismus.org deployment; replace them with your own privacy policy and terms before going live.

## Related documentation

- [Environment Variables](./environment.md) — full list of environment variables, including `APP_LOGO`
- [Security and Privacy Overview](./SECURITY.md) — database encryption, launcher, and data handling
