import adapterDriver from "../drivers/adapter.driver.js";

/**
 * @description get grant key for id
 * @param {String} [id]
 * @returns {String}
 */
function grantKeyFor(id) {
  return `grant:${id}`;
}
/**
 * @description get session uid for id
 * @param {String} [id]
 * @returns {String}
 */
function sessionUidKeyFor(id) {
  return `sessionUid:${id}`;
}
/**
 * @description get userCode for userCode
 * @param {String} [userCode]
 * @returns {String}
 */
function userCodeKeyFor(userCode) {
  return `userCode:${userCode}`;
}
/**
 * @description set for grantables
 */
const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);
/**
 * @description used within oidc provider
 * @class [Adapter adapter]
 */
class Adapter {
    /**
     * @constructor
     * @param {String} [model]
     */
    constructor(model) {
      this.model = model;
    }
    /**
     * @description get key for id and the current model
     * @param {String} [id]
     * @returns {String}
     */
    key(id) {
      return `${this.model}:${id}`;
    }
    /**
     * @description delete item with id of current model
     * @param {String} [id]
     */
    async destroy(id) {
      const key = this.key(id);
      adapterDriver.remove(key);
    }
    /**
     * @description consume item with id of current model
     * @param {String} [id]
     */
    async consume(id) {
      let v = adapterDriver.get(this.key(id))
      v.consumed = Math.floor(Date.now() / 1000);
      adapterDriver.set(id,v)
    }
    /**
     * @description find item with id of current model
     * @param {String} [id]
     * @returns {JSON}
     */
    async find(id) {
      return adapterDriver.get(this.key(id));
    }
    /**
     * @description find item with uid of current model
     * @param {String} [uid]
     * @returns {JSON}
     */
    async findByUid(uid) {
      const id = adapterDriver.get(sessionUidKeyFor(uid));
      return this.find(id);
    }
    /**
     * @description find item with userCode of current model
     * @param {String} [userCode]
     * @returns {JSON}
     */
    async findByUserCode(userCode) {
      const id = adapterDriver.get(userCodeKeyFor(userCode));
      return this.find(id);
    }
      /**
     * @description upsert payload using id and passing expiresIn
     * @param {String} [grantId]
     * @param {JSON} [payload]
     * @param {Number} [expiresIn]
     */
    async upsert(id, payload, expiresIn) {
      const key = this.key(id);
  
      if (this.model === 'Session') {
        adapterDriver.set(sessionUidKeyFor(payload.uid), id, expiresIn);
      }
  
      const { grantId, userCode } = payload;
      if (grantable.has(this.model) && grantId) {
        const grantKey = grantKeyFor(grantId);
        const grant = adapterDriver.get(grantKey);
        if (!grant) {
          adapterDriver.set(grantKey, [key]);
        } else {
          grant.push(key);
        }
      }
  
      if (userCode) {
        adapterDriver.set(userCodeKeyFor(userCode), id, expiresIn);
      }
  
      adapterDriver.set(key, payload, expiresIn);
    }
    /**
     * @description revoke by grantId
     * @param {String} [grantId]
     */
    async revokeByGrantId(grantId) {
      const grantKey = grantKeyFor(grantId);
      const grant = adapterDriver.get(grantKey);
      if (grant) {
        grant.forEach((token) => adapterDriver.remove(token));
        adapterDriver.remove(grantKey);
      }
    }
  }
  
  export default Adapter;