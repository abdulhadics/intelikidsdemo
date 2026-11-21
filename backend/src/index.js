'use strict';

const lessons = require('../lessons');
const contentType = 'api::content.content';
const progressType = 'api::lesson-progress.lesson-progress';
const studentEmail = 'student@intellikids.test';

module.exports = {
  async bootstrap({ strapi }) {
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });
    const permissions = strapi.db.query('plugin::users-permissions.permission');
    const actions = [
      contentType + '.find',
      contentType + '.findOne',
      progressType + '.mine',
      progressType + '.checkpoint',
      progressType + '.submitCheckpoint',
    ];
    for (const action of actions) {
      if (!(await permissions.findOne({ where: { action, role: role.id } }))) {
        await permissions.create({ data: { action, role: role.id } });
      }
    }

    const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advanced = await store.get({ key: 'advanced' });
    if (advanced.allow_register) {
      await store.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
    }

    const student = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: studentEmail },
    });
    if (!student) {
      await strapi.plugin('users-permissions').service('user').add({
        username: 'demo-student',
        email: studentEmail,
        password: 'IntelliKids30!',
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
    }

    for (const { checkpoint, ...lesson } of lessons) {
      const record = await strapi.db.query(contentType).findOne({ where: { video_path: lesson.video_path } });
      if (!record) {
        await strapi.entityService.create(contentType, {
          data: { ...lesson, publishedAt: new Date() },
        });
      }
    }
  },
};
