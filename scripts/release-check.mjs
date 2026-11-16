#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import semver from 'semver';

const fail = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

if (!semver.valid(version)) {
    fail(`package.json version "${version}" is not valid SemVer`);
}

const tags = git('tag', '--list', 'v*')
    .split('\n')
    .filter(Boolean)
    .map((t) => t.replace(/^v/, ''))
    .filter((v) => semver.valid(v));

if (tags.length === 0) {
    console.log(`✓ ${version} — no v* tags yet, bootstrapping first release`);
    process.exit(0);
}

const highest = tags.sort(semver.rcompare)[0];

if (semver.lte(version, highest)) {
    fail(
        `package.json is ${version} but the highest tag is v${highest}.\n` +
        `  Bump the version (e.g. ${semver.inc(highest, 'patch')}) before merging into main.`
    );
}

console.log(`✓ ${version} > v${highest}`);