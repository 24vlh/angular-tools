const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ENV_BROWSER_KEYS = ['CHROME_BIN', 'CHROMIUM_BIN', 'EDGE_BIN'];
const WINDOWS_BROWSER_PATHS = [
  path.join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env.PROGRAMFILES || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft/Edge/Application/msedge.exe')
];
const WSL_BROWSER_PATHS = [
  '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];
const LINUX_BROWSER_NAMES = [
  'chromium-browser',
  'chromium',
  'google-chrome',
  'google-chrome-stable',
  'microsoft-edge',
  'msedge'
];

function isUsablePath(filePath) {
  return Boolean(filePath) && fs.existsSync(filePath);
}

function resolveFromEnvironment() {
  for (const envKey of ENV_BROWSER_KEYS) {
    const browserPath = process.env[envKey];

    if (isUsablePath(browserPath)) {
      return browserPath;
    }
  }

  return null;
}

function resolveFromPuppeteer() {
  try {
    const puppeteer = require('puppeteer');
    const browserPath = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : null;

    return isUsablePath(browserPath) ? browserPath : null;
  } catch {
    return null;
  }
}

function resolveFromWindows() {
  for (const browserPath of WINDOWS_BROWSER_PATHS) {
    if (isUsablePath(browserPath)) {
      return browserPath;
    }
  }

  for (const binaryName of ['chrome.exe', 'msedge.exe']) {
    const result = spawnSync('where.exe', [binaryName], {
      encoding: 'utf8',
      windowsHide: true
    });

    if (result.status !== 0) {
      continue;
    }

    const browserPath = result.stdout
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find(isUsablePath);

    if (browserPath) {
      return browserPath;
    }
  }

  return null;
}

function resolveFromWslWindows() {
  for (const browserPath of WSL_BROWSER_PATHS) {
    if (isUsablePath(browserPath)) {
      return browserPath;
    }
  }

  return null;
}

function resolveFromLinux() {
  for (const binaryName of LINUX_BROWSER_NAMES) {
    const result = spawnSync('sh', ['-lc', `command -v ${binaryName}`], {
      encoding: 'utf8'
    });

    if (result.status !== 0) {
      continue;
    }

    const browserPath = result.stdout
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find(isUsablePath);

    if (browserPath) {
      return browserPath;
    }
  }

  return null;
}

function resolveKarmaBrowser() {
  return resolveFromEnvironment()
    || resolveFromPuppeteer()
    || (process.platform === 'win32' ? resolveFromWindows() : resolveFromLinux())
    || (process.platform === 'linux' ? resolveFromWslWindows() : null);
}

function applyKarmaBrowserEnvironment() {
  const browserPath = resolveKarmaBrowser();

  if (browserPath) {
    process.env.CHROME_BIN = browserPath;
  }

  return browserPath;
}

module.exports = {
  applyKarmaBrowserEnvironment,
  resolveKarmaBrowser
};
