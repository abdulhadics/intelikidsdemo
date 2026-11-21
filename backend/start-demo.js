'use strict';

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

require('@strapi/strapi')({ serveAdminPanel: false }).start();
