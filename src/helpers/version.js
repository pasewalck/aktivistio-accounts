import { readFileSync } from 'fs';

const pkgVersion = () => {
	const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
	if (!pkg || typeof pkg.version !== 'string' || pkg.version === '') {
		throw new Error('package.json unlesbar oder ohne version-Feld');
	}
	return pkg.version;
};

export const version = pkgVersion();
