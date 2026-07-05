// Preflight for local development. Assigns a unique app name on first run,
// checks that you're logged in / initialized / have a playtest subreddit, then
// starts the dev servers. No external dependencies.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

function randomSuffix(n) {
  const a = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

function ensureAppName() {
  const p = path.join(process.cwd(), 'devvit.yaml');
  const content = fs.readFileSync(p, 'utf8');
  if (content.includes('YOUR_APP_NAME')) {
    const name = `hive-mind-${randomSuffix(6)}`;
    fs.writeFileSync(p, `name: ${name}\n`);
    console.log(`Assigned app name: ${name}`);
  }
}

function runChecks() {
  const checks = [];

  const loggedIn = fs.existsSync(path.join(os.homedir(), '.devvit', 'token'));
  checks.push([
    'Authentication',
    loggedIn,
    loggedIn ? "You're logged in." : 'Run `npm run login` to authenticate with Reddit.',
  ]);

  const initialized = fs.existsSync(path.join(process.cwd(), '.initialized'));
  checks.push([
    'App initialization',
    initialized,
    initialized ? 'App initialized.' : 'Run `npm run devvit:init` to register the app.',
  ]);

  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const devDevvit = pkg.scripts && pkg.scripts['dev:devvit'];
  const hasSub = devDevvit && !devDevvit.includes('YOUR_SUBREDDIT_NAME');
  checks.push([
    'Playtest subreddit',
    hasSub,
    hasSub
      ? 'Subreddit configured.'
      : 'Replace YOUR_SUBREDDIT_NAME in the "dev:devvit" script with your test subreddit.',
  ]);

  let allPass = true;
  for (const [name, pass, msg] of checks) {
    console.log(`${pass ? '✅' : '❌'}  ${name}: ${msg}`);
    if (!pass) allPass = false;
  }
  return allPass;
}

function main() {
  ensureAppName();
  if (!runChecks()) {
    console.log('\nFix the items above, then run `npm run dev` again.');
    process.exit(1);
  }
  console.log('\nAll checks passed. Starting dev servers…');
  const child = exec('npm run dev:all');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

main();
