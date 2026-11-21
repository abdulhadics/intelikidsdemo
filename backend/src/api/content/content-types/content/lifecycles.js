'use strict';

const { ValidationError } = require('@strapi/utils').errors;

function requireVideo(entry) {
  if (!entry?.video_path && !entry?.video) {
    throw new ValidationError('Add a lesson video and save before publishing.');
  }
}

module.exports = {
  beforeCreate({ params: { data } }) {
    if (data.publishedAt) requireVideo(data);
  },

  async beforeUpdate({ params: { data, where } }) {
    if (!data.publishedAt) return;

    const entry = await strapi.db.query('api::content.content').findOne({
      where,
      select: ['video_path'],
      populate: { video: { select: ['id'] } },
    });
    requireVideo(entry);
  },
};
