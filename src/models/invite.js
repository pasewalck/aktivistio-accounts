/**
 * Represents an invite code in the application.
 * @class Invite
 */
export class Invite {
	/**
	 * @description Initializes a new invite with the specified properties.
	 * @constructor
	 * @param {string} code - The unique invite code.
	 * @param {number} createDate - Unix timestamp when the invite was created.
	 * @param {number} uses - Number of times the invite has been used.
	 * @param {number} maxUses - Maximum number of times the invite can be used.
	 * @param {number|null} expireDate - Unix timestamp when the invite expires (null if never expires).
	 * @param {number|null} maxUse - Not sure what this is, need clarification.
	 * @param {import('./accounts.js')|null} linkedAccount - The account that created this invite (null for system invites).
	 * @param {boolean} systemInvite - Whether this is a system-wide invite.
	 */
	constructor(code, createDate, uses, maxUses, expireDate, maxUse, linkedAccount, systemInvite) {
		this.code = code;
		this.createDate = createDate;
		this.uses = uses;
		this.maxUses = maxUses;
		this.expireDate = expireDate;
		this.maxUse = maxUse;
		this.linkedAccount = linkedAccount;
		this.systemInvite = systemInvite;
	}

	/**
	 * @description Check if the invite is expired.
	 * @returns {boolean} - True if the invite has expired, false otherwise.
	 */
	isExpired() {
		if (!this.expireDate) {
			return false;
		}
		return Date.now() / 1000 > this.expireDate;
	}

	/**
	 * @description Check if the invite has uses remaining.
	 * @returns {boolean} - True if the invite can still be used, false otherwise.
	 */
	hasUsesRemaining() {
		return this.uses < this.maxUses;
	}

	/**
	 * @description Check if the invite is a system invite.
	 * @returns {boolean} - True if this is a system invite, false otherwise.
	 */
	isSystemInvite() {
		return this.systemInvite === true;
	}

	/**
	 * @description Check if the invite has a linked account.
	 * @returns {boolean} - True if there is a linked account, false otherwise.
	 */
	hasLinkedAccount() {
		return this.linkedAccount !== null && this.linkedAccount !== undefined;
	}
}
