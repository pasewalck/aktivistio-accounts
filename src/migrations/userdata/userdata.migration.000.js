import MigrationVersion from '../../models/migration-version.js';
import Migration from '../../models/migration.js';

export default new MigrationVersion(0, [
	new Migration((db) => {
		// Initialize the accounts table if it does not exist
		db.exec(`
				create table IF NOT EXISTS accounts (
					id TEXT NOT NULL PRIMARY KEY,
					username TEXT NOT NULL UNIQUE,
					password_hash TEXT,
					recovery_token_hash TEXT,
					recovery_email_hash TEXT,
					role_id INTEGER NOT NULL,
					two_factor_secret TEXT,
					is_active INTEGER NOT NULL DEFAULT 0,
					last_login INTEGER
				);
			`);
	}),
	new Migration((db) => {
		// Initialize the action tokens table if it does not exist
		db.exec(`
				CREATE TABLE IF NOT EXISTS action_tokens (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					token TEXT NOT NULL UNIQUE,
					token_type TEXT NOT NULL,
					payload TEXT,
					created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
					expires_at INTEGER NOT NULL
				);
			`);
	}),
	new Migration((db) => {
		// Initialize the accounts audit log table if it does not exist
		db.exec(`
			create table IF NOT EXISTS audit_log (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
				start_time INTEGER NOT NULL,
				end_time INTEGER NOT NULL,
				action_type_id INTEGER NOT NULL,
				count INTEGER NOT NULL DEFAULT 1
			);
		`);
	}),
	new Migration((db) => {
		// Initialize the invites table if it does not exist
		db.exec(`
				create table IF NOT EXISTS invites (
				code TEXT NOT NULL PRIMARY KEY,
				validation_date INTEGER NOT NULL DEFAULT (strftime('%s','now')),
				expire_date INTEGER DEFAULT NULL,
				usages INTEGER DEFAULT 1
				);
			`);
	}),
	new Migration((db) => {
		// Initialize the email invite requests table if it does not exist
		db.exec(`
				create table IF NOT EXISTS email_invite_requests (
				email_fingerprint BLOB NOT NULL PRIMARY KEY,
				code TEXT REFERENCES invites (code) ON DELETE SET NULL
				);
			`);
	}),
	new Migration((db) => {
		// Initialize the account invites table if it does not exist
		db.exec(`
				create table IF NOT EXISTS account_invites (
				code TEXT REFERENCES invites (code) ON DELETE CASCADE,
				id TEXT REFERENCES accounts (id) ON DELETE CASCADE,
				PRIMARY KEY (code, id)
				);
			`);
	}),
]);
