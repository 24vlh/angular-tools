const { spawnSync } = require('node:child_process');
const { resolveKarmaBrowser } = require('./karma.browser');

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

const existingBrowserPath = resolveKarmaBrowser();
const isWslWindowsExecutable =
  process.platform === 'linux' && Boolean(existingBrowserPath) && existingBrowserPath.toLowerCase().endsWith('.exe');

if (existingBrowserPath && !isWslWindowsExecutable) {
  console.log(`[karma] Using browser: ${existingBrowserPath}`);
  process.exit(0);
}

const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const installResult = spawnSync(
  pnpmCommand,
  ['exec', 'puppeteer', 'browsers', 'install', 'chrome'],
  {
    cwd: __dirname,
    stdio: 'inherit'
  }
);

if (installResult.error) {
  exitWithError(`[karma] Failed to install a test browser: ${installResult.error.message}`);
}

if (installResult.status !== 0) {
  process.exit(installResult.status || 1);
}

const installedBrowserPath = resolveKarmaBrowser();

if (!installedBrowserPath) {
  exitWithError('[karma] Browser install completed, but no executable could be resolved.');
}

console.log(`[karma] Using browser: ${installedBrowserPath}`);
