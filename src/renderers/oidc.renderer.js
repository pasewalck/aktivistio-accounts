/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description Renders the consent page for login authorization.
     * Displays the consent form to the user, allowing them to authorize the requested action.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {string} uid - The unique identifier for the interaction session.
     * @param {string} clientId - The ID of the client requesting authorization.
     */
    consent: (req, res, uid, clientId) => {
        return res.render('pages/oidc/consent', {
            title: res.__('page.title.authorize'),
            clientId,
            urls: {
                action: `/interaction/${uid}/confirm/`,
                abort: `/interaction/${uid}/abort/`
            }
        });
    },
};
