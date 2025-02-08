/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description controller for changing language
     * @param {Request} [req]
     * @param {Response} [res]
     */
    changeLanguage: (req,res) => {
        const { lng } = req.query;
        res.cookie('i18n', lng);
        const redirectPath = req.get('Referrer') || '/';
        res.redirect(redirectPath);
    }
}
