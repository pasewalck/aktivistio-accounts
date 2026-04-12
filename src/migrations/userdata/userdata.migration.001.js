import MigrationVersion from '../../models/migration-version.js';
import Migration from '../../models/migration.js';

export default new MigrationVersion(1, [
	new Migration((db) => {
		db.exec(`
			ALTER TABLE invites ADD COLUMN last_use INTEGER;
			ALTER TABLE invites ADD COLUMN max_uses INTEGER DEFAULT 1;
			ALTER TABLE invites ADD COLUMN uses INTEGER DEFAULT 0;
			UPDATE invites SET max_uses = usages;
		`);
	}),
	new Migration((db) => {
		db.exec(`
			ALTER TABLE invites DROP COLUMN usages;
		`);
	}),
	new Migration((db) => {
		db.exec(`
			ALTER TABLE invites ADD COLUMN system_invite INTEGER DEFAULT 0;
		`);
	}),
]);
