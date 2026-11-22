'use strict';

const fs = require('node:fs');
const path = require('node:path');

const indexFile = path.join(__dirname, 'dist', 'frontend', 'index.html');
const backendUrl = process.env.DEMO_BACKEND_URL?.trim();

if (!backendUrl) {
  const assets = path.join(path.dirname(indexFile), 'assets');
  const lessons = require('../backend/lessons');
  fs.writeFileSync(path.join(assets, 'demo-lessons.json'), JSON.stringify(lessons));
  fs.cpSync(path.join(__dirname, '../backend/public/lesson-media'), path.join(path.dirname(indexFile), 'lesson-media'), { recursive: true });
}

if (backendUrl) {
  const url = new URL(backendUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('DEMO_BACKEND_URL must be the HTTPS origin of Strapi.');
  }

  const index = fs.readFileSync(indexFile, 'utf8');
  const tag = `<meta name="intellikids-backend" content="${url.origin}">`;
  fs.writeFileSync(indexFile, index.replace('</head>', tag + '\n</head>'));
}
