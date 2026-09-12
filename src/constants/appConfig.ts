import packageJson from '../../package.json';

export const APP_CONFIG = {
  appName: 'QuickBite',
  version: packageJson.version || '1.0.12',
  buildNumber: 12,
  githubRepo: 'zyentric/Quick-Bite',
  apiReleaseUrl: 'https://api.github.com/repos/zyentric/Quick-Bite/releases/latest',
};

export const APP_VERSION = APP_CONFIG.version;
export default APP_CONFIG;
