'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/lesson-progress', handler: 'lesson-progress.mine' },
    { method: 'GET', path: '/contents/:id/checkpoint', handler: 'lesson-progress.checkpoint' },
    { method: 'POST', path: '/contents/:id/checkpoint', handler: 'lesson-progress.submitCheckpoint' },
  ],
};
