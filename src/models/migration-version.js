/**
 * Represents a collection of migrations grouped by a specific version.
 * @class MigrationVersion
 */
export default class MigrationVersion {
	/**
	 * Creates a new MigrationVersion instance.
	 * @param {number} version - Numeric representation of the version for database comparison.
	 * @param {Migration[]} migrations - Array of Migration instances to be applied for this version
	 */
	constructor(version, migrations) {
		/**
		 * Numeric representation of the version for database comparison.
		 * @type {number}
		 */
		this.version = version;
		/**
		 * Array of Migration instances for this version
		 * @type {Migration[]}
		 */
		this.migrations = migrations;
	}
}
