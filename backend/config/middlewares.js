module.exports = ({ env }) => [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https://*.media.strapiapp.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://*.media.strapiapp.com'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: { origin: env.array('DEMO_FRONTEND_ORIGINS', ['*']) },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
