import { describe, it, expect } from 'vitest';
import { Role, Permission, roleHierarchy, rolePermissions, hasPermission } from '../../../src/models/roles.js';

describe('Role hierarchy', () => {
	it('USER has no lower roles', () => {
		expect(Role.allLower(Role.USER)).toEqual([]);
	});

	it('ADMIN includes lower roles but not itself', () => {
		const lower = Role.allLower(Role.ADMIN);

		expect(lower).toContain(Role.USER);
		expect(lower).toContain(Role.MODERATOR);
		expect(lower).not.toContain(Role.ADMIN);
	});

	it('SUPER_ADMIN includes every other role', () => {
		const lower = Role.allLower(Role.SUPER_ADMIN);

		for (const role of Role.all()) {
			if (role !== Role.SUPER_ADMIN) {
				expect(lower).toContain(role);
			}
		}
	});
});

describe('permissions', () => {
	it('USER has NO permissions', () => {
		for (const permission in Permission.all()) {
			expect(hasPermission(Role.USER, permission)).toBe(false);
		}
	});

	it('permissions are inherited through role hierarchy and only these', () => {
		for (const role in Role.all()) {
			const roleSet = new Set(Permission.all());
			const rolePerms = rolePermissions[role];
			for (let index = 0; index < rolePerms.length; index++) {
				expect(hasPermission(role, rolePerms[index])).toBe(true);
				roleSet.delete(rolePerms[index]);
			}
			for (const subRole in roleHierarchy[role]) {
				for (const subRolePerm in rolePermissions[subRole]) {
					expect(hasPermission(role, subRolePerm)).toBe(true);
					roleSet.delete(subRolePerm);
				}
			}
			for (const role in roleSet) {
				expect(hasPermission(role, role)).toBe(false);
			}
		}
	});
});

describe('SUPER_ADMIN permissions', () => {
	it('has every defined permission', () => {
		for (const perm of Object.values(Permission)) {
			expect(hasPermission(Role.SUPER_ADMIN, perm)).toBe(true);
		}
	});
});
