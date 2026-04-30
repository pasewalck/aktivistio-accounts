import MigrationVersion from '../../models/migration-version.js';
import Migration from '../../models/migration.js';

export default new MigrationVersion(2, [
	new Migration((db) => {
		db.exec(`
			ALTER TABLE invites ADD COLUMN label TEXT DEFAULT NULL;
		`);
	}),
]);
