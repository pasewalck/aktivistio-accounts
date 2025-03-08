/**
 * @typedef {import("express").Request} Request
 * Represents an HTTP request in Express.
 */

/**
 * @typedef {import("express").Response} Response
 * Represents an HTTP response in Express.
 */

export default {
    /**
     * @description Controller for changing the application's language.
     * This function sets a cookie with the selected language and redirects the user
     * back to the referring page or to the home page if no referrer is available.
     * @param {Request} req - The HTTP request object, which contains the query parameters.
     * @param {Response} res - The HTTP response object, used to set cookies and redirect.
     * @returns {void} This function does not return a value; it sends a response directly.
     */
    changeLanguage: (req, res) => {
        // Extract the language code from the query parameters
        const { lng } = req.query;

        // Set a cookie named 'i18n' with the selected language code
        res.cookie('i18n', lng);

        // Get the referring URL or default to the home page
        const redirectPath = req.get('Referrer') || '/';

        // Redirect the user to the referring page or home page
        res.redirect(redirectPath);
    }
}
