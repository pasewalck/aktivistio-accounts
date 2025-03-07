/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description shared renderer for login page
     * @param {Response} [res]
     * @param {JSON|undefined} [interactionDetails]
     * @param {JSON} [errors]
     */
    twoFactorAuth: (res,loginToken,interactionDetails=null,errors={}) => {
        return res.render('cards/2fa', {
            title: res.__('Login'),
            urls: {action:actionUrl,abort:abortUrl},
            interactionDetails: interactionDetails,
            errors: errors,
            loginToken: loginToken
        });
    },
    /**
     * @description shared renderer for login page
     * @param {Response} [res]
     * @param {JSON|undefined} [interactionDetails]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    login: (res,interactionDetails=null,formData={},errors={}) => {
        return res.render('cards/login', {
            title: res.__('Login'),
            interactionDetails: interactionDetails,
            formData: formData,
            errors: errors
        });
    },    

}