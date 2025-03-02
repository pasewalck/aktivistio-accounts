
/**
 * Represents an account.
 * @class [Account account]
 */
export class Account {

    /**
     * @constructor
     * @param {String} [id]
     * @param {String} [username]
     * @param {Number} [roleId]
     */
    constructor (id,username,roleId) {
        this.id = id
        this.username = username
        this.role = roleId
    }

}