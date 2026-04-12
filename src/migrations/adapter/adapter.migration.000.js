import MigrationVersion from '../../models/migration-version.js';
import Migration from '../../models/migration.js';

export default new MigrationVersion('1.0.0', [
	new Migration((db) => {
		// Create tables for storing entries if they do not already exist
		db.exec(`
            CREATE TABLE IF NOT EXISTS entries (
                id TEXT,
                model TEXT NOT NULL,
                value TEXT NOT NULL,
                expire INTEGER,
                PRIMARY KEY (model, id)
            );
        `);
	}),
	new Migration((db) => {
		// Create tables for storing lookups for entries if they do not already exist
		db.exec(`
            CREATE TABLE IF NOT EXISTS entries_lookup (
                entry_id TEXT,
                entry_model TEXT,
                name TEXT NOT NULL,
                lookup_value TEXT NOT NULL,
                PRIMARY KEY (name, entry_model, lookup_value, entry_id),
                FOREIGN KEY (entry_id, entry_model) REFERENCES entries (id, model) ON DELETE CASCADE
            );
        `);
	}),
]);
