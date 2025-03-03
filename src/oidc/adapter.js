import adapterService from "../services/adapter.service.js";

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
      adapterService.removeEntry(id)
    }
    /**
     * @description consume item with id of current model
     * @param {String} [id]
     */
    async consume(id) {
      let v = adapterService.getEntry(this.key(id))
      v.consumed = Math.floor(Date.now() / 1000);
      adapterService.setEntry(id,v)
    }
    /**
     * @description find item with id of current model
     * @param {String} [id]
     * @returns {JSON}
     */
    async find(id) {
      return adapterService.getEntry(this.key(id));
    }
    /**
     * @description find item with uid of current model
     * @param {String} [uid]
     * @returns {JSON}
     */
    async findByUid(uid) {
      const id = adapterService.getEntry(sessionUidKeyFor(uid));
      return this.find(id);
    }
    /**
     * @description find item with userCode of current model
     * @param {String} [userCode]
     * @returns {JSON}
     */
    async findByUserCode(userCode) {
      const id = adapterService.getEntry(userCodeKeyFor(userCode));
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
        adapterService.setEntry(sessionUidKeyFor(payload.uid), id, expiresIn);
      }
  
      const { grantId, userCode } = payload;
      if (grantable.has(this.model) && grantId) {
        const grantKey = grantKeyFor(grantId);
        const grant = adapterService.getEntry(grantKey);
        if (!grant) {
          adapterService.setEntry(grantKey, [key]);
        } else {
          grant.push(key);
        }
        adapterService.setEntry(grantKey,grant);
      }
  
      if (userCode) {
        adapterService.setEntry(userCodeKeyFor(userCode), id, expiresIn);
      }
  
      adapterService.setEntry(key, payload, expiresIn);
    }
    /**
     * @description revoke by grantId
     * @param {String} [grantId]
     */
    async revokeByGrantId(grantId) {
      const grantKey = grantKeyFor(grantId);
      const grant = adapterService.getEntry(grantKey);
      if (grant) {
        grant.forEach((token) => adapterService.removeEntry(token));
        adapterService.removeEntry(grantKey);
      }
    }
  }
  
  export default Adapter;