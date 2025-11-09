/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
import adapterService from "../services/adapter.service.js";

/**
 * @description Set of grantable types for token management.
 * @type {Set<string>}
 */
const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);

/**
 * @description Enum for lookup keys used in the adapter.
 * @enum {string}
 */
const LookupKeys = {
  SESSION_UID: "SessionUid",
  USER_CODE: "UserCode",
  GRANT: "Grant"
};

/**
 * @description Adapter class for managing OIDC entries.
 * @class Adapter
 */
class Adapter {
    /**
     * @constructor
     * @param {string} model - The type of model this adapter will manage (e.g., AccessToken, Session).
     */
    constructor(model) {
      this.model = model;
    }

    /**
     * @description Deletes an entry identified by the given ID from the current model.
     * @param {string} id - The ID of the entry to delete.
     * @returns {Promise<void>} - A promise that resolves when the entry is deleted.
     */
    async destroy(id) {
      adapterService.removeEntry(this.model, id);
    }

    /**
     * @description Marks an entry identified by the given ID as consumed.
     * @param {string} id - The ID of the entry to consume.
     * @returns {Promise<void>} - A promise that resolves when the entry is marked as consumed.
     */
    async consume(id) {
      // Retrieve the entry from the adapter service
      const entry = await adapterService.getEntry(this.model, id);
      // Set the consumed timestamp to the current time in seconds
      entry.consumed = Math.floor(Date.now() / 1000);
      // Update the entry in the adapter service
      await adapterService.setEntry(this.model, id, entry);
    }

    /**
     * @description Retrieves an entry identified by the given ID from the current model.
     * @param {string} id - The ID of the entry to find.
     * @returns {Promise<object|null>} - The found entry as a JSON object, or null if not found.
     */
    async find(id) {
      return adapterService.getEntry(this.model, id);
    }

    /**
     * @description Finds an entry using its unique identifier (UID).
     * @param {string} uid - The UID of the entry to find.
     * @returns {Promise<object|null>} - The found entry as a JSON object, or null if not found.
     */
    async findByUid(uid) {
      return adapterService.getEntryByLookup(this.model, LookupKeys.SESSION_UID, uid);
    }

    /**
     * @description Finds an entry using its user code.
     * @param {string} userCode - The user code of the entry to find.
     * @returns {Promise<object|null>} - The found entry as a JSON object, or null if not found.
     */
    async findByUserCode(userCode) {
      return adapterService.getEntryByLookup(this.model, LookupKeys.USER_CODE, userCode);
    }

    /**
     * @description Inserts or updates an entry with the given ID and payload, setting an expiration time.
     * @param {string} id - The ID of the entry to upsert.
     * @param {object} payload - The data to store in the entry.
     * @param {number} expiresIn - The expiration time in seconds for the entry.
     * @returns {Promise<void>} - A promise that resolves when the entry is upserted.
     */
    async upsert(id, payload, expiresIn) {
      // Store the entry in the adapter service with the specified expiration time
      await adapterService.setEntry(this.model, id, payload, expiresIn);

      // If the model is 'Session', set the lookup for the entry using the UID
      if (this.model === 'Session') {
          await adapterService.setLookupForEntry(this.model, id, LookupKeys.SESSION_UID, payload.uid);
      }

      const { grantId, userCode } = payload; // Destructure grantId and userCode from the payload for easier access


      // If the model is grantable and grantId is provided, set the lookup for the grant ID
      if (grantable.has(this.model) && grantId) {
          await adapterService.setLookupForEntry(this.model, id, LookupKeys.GRANT, grantId);
      }

      // If userCode is provided, set the lookup for the user code
      if (userCode) {
        await adapterService.setLookupForEntry(this.model, id, LookupKeys.USER_CODE, userCode);
      }
    }

    /**
     * @description Revokes an entry by its grant ID.
     * @param {string} grantId - The grant ID of the entry to revoke.
     * @returns {Promise<void>} - A promise that resolves when the entry is revoked.
     */
    async revokeByGrantId(grantId) {
      adapterService.removeEntryByLookup(this.model, LookupKeys.GRANT, grantId);
    }
}
  
export default Adapter;
