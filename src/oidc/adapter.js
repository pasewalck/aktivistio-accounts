import adapterService from "../services/adapter.service.js";

/**
 * @description Set of grantable types for token management.
 * @type {Set<String>}
 */
const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);

/**
 * @description Adapter class for managing OIDC entries.
 * @class Adapter
 */
class Adapter {
    /**
     * @constructor
     * @param {String} model - The type of model this adapter will manage (e.g., AccessToken, Session).
     */
    constructor(model) {
      this.model = model;
    }

    /**
     * @description Deletes an entry identified by the given ID from the current model.
     * @param {String} id - The ID of the entry to delete.
     */
    async destroy(id) {
      adapterService.removeEntry(this.model, id);
    }

    /**
     * @description Marks an entry identified by the given ID as consumed.
     * @param {String} id - The ID of the entry to consume.
     */
    async consume(id) {
      const entry = adapterService.getEntry(this.model, id);
      entry.consumed = Math.floor(Date.now() / 1000);
      adapterService.setEntry(this.model, id, entry);
    }

    /**
     * @description Retrieves an entry identified by the given ID from the current model.
     * @param {String} id - The ID of the entry to find.
     * @returns {Promise<JSON>} - The found entry as a JSON object.
     */
    async find(id) {
      return adapterService.getEntry(this.model, id);
    }

    /**
     * @description Finds an entry using its unique identifier (UID).
     * @param {String} uid - The UID of the entry to find.
     * @returns {Promise<JSON>} - The found entry as a JSON object.
     */
    async findByUid(uid) {
      return adapterService.getEntryByLookup(this.model, "SessionUid", uid);
    }

    /**
     * @description Finds an entry using its user code.
     * @param {String} userCode - The user code of the entry to find.
     * @returns {Promise<JSON>} - The found entry as a JSON object.
     */
    async findByUserCode(userCode) {
      return adapterService.getEntryByLookup(this.model, "UserCode", userCode);
    }

    /**
     * @description Inserts or updates an entry with the given ID and payload, setting an expiration time.
     * @param {String} id - The ID of the entry to upsert.
     * @param {JSON} payload - The data to store in the entry.
     * @param {Number} expiresIn - The expiration time in seconds for the entry.
     */
    async upsert(id, payload, expiresIn) {
      adapterService.setEntry(this.model, id, payload, expiresIn);

      if (this.model === 'Session') {
        adapterService.setLookupForEntry(this.model, id, "SessionUid", payload.uid);
      }

      const { grantId, userCode } = payload;
      if (grantable.has(this.model) && grantId) {
        adapterService.setLookupForEntry(this.model, id, "Grant", grantId);
      }

      if (userCode) {
        adapterService.setLookupForEntry(this.model, id, "UserCode", userCode);
      }

    }

    /**
     * @description Revokes an entry by its grant ID.
     * @param {String} grantId - The grant ID of the entry to revoke.
     */
    async revokeByGrantId(grantId) {
      adapterService.removeEntryByLookup(this.model, "Grant", grantId);
    }
}
  
export default Adapter;