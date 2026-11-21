'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const lessons = require('../../../../lessons');

const contentType = 'api::content.content';

async function addPlaybackDetails(entries) {
  if (!entries.length) return [];

  const records = await strapi.db.query(contentType).findMany({
    where: { id: { $in: entries.map(entry => entry.id) }, publishedAt: { $notNull: true } },
    select: ['id', 'video_path'],
    populate: { video: { select: ['url'] } },
  });
  const recordsById = new Map(records.map(record => [record.id, record]));
  const published = [];
  for (const entry of entries) {
    const record = recordsById.get(entry.id);
    if (!record) continue;

    entry.attributes.videoUrl = record.video?.url ?? record.video_path ?? null;
    entry.attributes.hasCheckpoint = lessons.some(lesson => lesson.video_path === record.video_path);
    published.push(entry);
  }
  return published;
}

module.exports = createCoreController(contentType, () => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, publicationState: 'live' };
    const response = await super.find(ctx);
    response.data = await addPlaybackDetails(response.data);
    return response;
  },

  async findOne(ctx) {
    ctx.query = { ...ctx.query, publicationState: 'live' };
    const response = await super.findOne(ctx);
    if (!response.data) return ctx.notFound();
    const [published] = await addPlaybackDetails([response.data]);
    if (!published) return ctx.notFound();
    response.data = published;
    return response;
  },
}));
