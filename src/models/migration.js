/**
 * Represents a single migration operation with forward and rollback capabilities.
 * @class Migration
 */
export default class Migration {
	/**
	 * Creates a new Migration instance.
	 * @param {Function} up - Function that executes the migration. Receives the database instance as a parameter.
	 * @param {Function} [down=() => {}] - Optional function that rolls back the migration. Receives the database instance as a parameter.
	 */
	constructor(up, down = () => {}) {
		this.up = up;
		this.down = down;
	}
}
