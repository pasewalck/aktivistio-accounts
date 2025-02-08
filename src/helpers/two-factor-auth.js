import speakeasy, { generateSecret } from "speakeasy"

export default {
    /**
     * @description generate a secret usable for 2fa
     * @returns {String}
     */
    generateSecret: () => {
        return speakeasy.generateSecret().base32
    },
    /**
     * @description generate a url for 2fa using a secret
     * @param {String} [secret]
     * @param {String} [issuer]
     * @param {String} [label]
     * @returns {String}
     */
    generateUrl: (secret,issuer,label) => {
        return speakeasy.otpauthURL({secret:secret,encoding:"base32",issuer:issuer,label:label})
    },
    /**
     * @description verify a token for a secret at the given time
     * @param {String} [secret]
     * @param {String} [token]
     * @returns {String}
     */
    verify: (secret,token) => {
        return speakeasy.totp.verify({secret:secret,token:token,encoding: 'base32',window:2})
    }
}
