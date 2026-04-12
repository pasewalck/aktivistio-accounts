/**
 * Represents a collection of migrations grouped by a specific version.
 * @class MigrationVersion
 */
export default class MigrationVersion {
	/**
	 * Creates a new MigrationVersion instance.
	 * @param {string} versionString - Semantic version string in format "major.minor.patch" (e.g., "1.0.0", "1.2.3")
	 * @param {Migration[]} migrations - Array of Migration instances to be applied for this version
	 */
	constructor(versionString, migrations) {
		/**
		 * The original semantic version string
		 * @type {string}
		 */
		this.versionString = versionString;
		const versionArray = versionString.split('.').map((v) => Number.parseInt(v));
		/**
		 * Numeric representation of the version for database comparison.
		 * @type {number}
		 */
		this.version = versionArray.reduce((p, c, i) => p + c * 10 ** (3 * (versionArray.length - 1 - i)), 0);
		/**
		 * Array of Migration instances for this version
		 * @type {Migration[]}
		 */
		this.migrations = migrations;
	}
}
