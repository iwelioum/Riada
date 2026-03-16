const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { join } = require('node:path');

function chromiumCandidates() {
  if (process.platform === 'win32') {
    return [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
  }

  if (process.platform === 'darwin') {
    return [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    ];
  }

  return [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/microsoft-edge'
  ];
}

if (!process.env.CHROME_BIN) {
  const detectedBrowserPath = chromiumCandidates().find((candidate) => existsSync(candidate));
  if (detectedBrowserPath) {
    process.env.CHROME_BIN = detectedBrowserPath;
    // eslint-disable-next-line no-console
    console.log(`[karma] CHROME_BIN detected: ${detectedBrowserPath}`);
  }
}

const angularCliPath = join(__dirname, '..', 'node_modules', '@angular', 'cli', 'lib', 'init.js');
const karmaArgs = ['test', ...process.argv.slice(2)];

const result = spawnSync(process.execPath, [angularCliPath, ...karmaArgs], {
  stdio: 'inherit',
  env: process.env
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
