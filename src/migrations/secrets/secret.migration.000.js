import MigrationVersion from '../../models/migration-version.js';
import Migration from '../../models/migration.js';

export default new MigrationVersion('1.0.0', [
	new Migration((db) => {
		// Initialize tables for the storage
		db.exec(`
            create table IF NOT EXISTS secrets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name text not null,
                value text not null,
                created INTEGER NOT NULL DEFAULT (strftime('%s','now'))
            );
        `);
	}),
]);
