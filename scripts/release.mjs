#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import semver from 'semver';
import { select } from '@inquirer/prompts';

const fail = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const git = (args, opts) => run('git', args, opts);
const log = (m) => console.log(m);
function run(cmd, args, opts = {}) {
    try {
        return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
    } catch (e) {
        const err = new Error(`${cmd} ${args.join(' ')} failed`);
        err.stderr = String(e.stderr ?? '').trim();
        err.stdout = String(e.stdout ?? '').trim();
        throw err;
    }
}
const pkgVersion = () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    if (!pkg || typeof pkg.version !== "string" || pkg.version === "") {
        throw new Error("package.json unlesbar oder ohne version-Feld");
    }
    return pkg.version;
}
const current = pkgVersion();

if (!semver.valid(current))
    fail(`package.json version "${current}" is not valid SemVer`);

if (git(['status', '--porcelain']))
    fail('working tree not clean — commit or stash first');

const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch === 'HEAD') fail('detached HEAD — check out a branch first');
if (branch === 'main') fail('run this from your working branch, not main');

const action = await select({
    message: 'What kind of release is this?',
    choices: [
        { name: 'Major', value: 'major' },
        { name: 'Minor', value: 'minor' },
        { name: 'Patch', value: 'patch' },
    ],
});

const target = semver.inc(current, action);

if (!target)
    fail(`cannot bump "${current}" by ${action}`);

const tag = `v${target}`;

run('pnpm', ['version', action, '--no-git-tag-version', '--silent']);
const after = pkgVersion();

if (after !== target)
    fail(`pnpm produced ${after}, expected ${target} — check version hooks`);

git(['add', 'package.json']);
try { git(['add', 'pnpm-lock.yaml']); } catch { /* no lockfile */ }
git(['commit', '-m', `chore: release ${tag}`]);
log(`Committed bump on ${branch}`);