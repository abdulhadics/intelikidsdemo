'use strict';

const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { existsSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const envFile = path.join(__dirname, '.env');
if (!existsSync(envFile)) {
  const key = () => randomBytes(32).toString('base64');
  const config = [
    'APP_KEYS=' + [key(), key()].join(','),
    'API_TOKEN_SALT=' + key(),
    'ADMIN_JWT_SECRET=' + key(),
    'TRANSFER_TOKEN_SALT=' + key(),
    'JWT_SECRET=' + key(),
    'DATABASE_CLIENT=sqlite',
    'DATABASE_FILENAME=.tmp/demo.db',
  ];
  writeFileSync(envFile, config.join('\n') + '\n', { flag: 'wx' });
}

process.chdir(__dirname);
process.env.STRAPI_TELEMETRY_DISABLED = 'true';
process.env.STRAPI_DISABLE_UPDATE_NOTIFICATION = 'true';

if (!existsSync(path.join(__dirname, 'build', 'index.html'))) {
  console.log('Building the Strapi CMS admin panel on first run…');
  const cli = path.join(__dirname, 'node_modules', '@strapi', 'strapi', 'bin', 'strapi.js');
  const build = spawnSync(process.execPath, [cli, 'build'], { stdio: 'inherit' });
  if (build.error) throw build.error;
  if (build.status !== 0) process.exit(build.status ?? 1);
}

require('@strapi/strapi')().start();
