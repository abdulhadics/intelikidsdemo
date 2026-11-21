'use strict';

const lessons = require('../../../../lessons');
const contentType = 'api::content.content';
const progressType = 'api::lesson-progress.lesson-progress';

async function getCheckpoint(lessonId) {
  const record = await strapi.db.query(contentType).findOne({
    where: { id: lessonId, publishedAt: { $notNull: true } },
    select: ['video_path'],
  });
  return lessons.find(lesson => lesson.video_path === record?.video_path)?.checkpoint;
}

module.exports = {
  async mine(ctx) {
    const studentId = ctx.state.user.id;
    const completions = await strapi.db.query(progressType).findMany({
      where: { studentId },
      select: ['lessonId', 'createdAt'],
    });
    ctx.body = { completions };
  },

  async checkpoint(ctx) {
    const lessonId = Number(ctx.params.id);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) return ctx.notFound();
    const exercise = await getCheckpoint(lessonId);
    if (!exercise) return ctx.notFound();
    const completion = await strapi.db.query(progressType).findOne({
      where: { lessonId, studentId: ctx.state.user.id },
      select: ['id'],
    });

    ctx.body = {
      prompt: exercise.prompt,
      choices: exercise.choices,
      completed: Boolean(completion),
    };
  },

  async submitCheckpoint(ctx) {
    const lessonId = Number(ctx.params.id);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) return ctx.notFound();
    const exercise = await getCheckpoint(lessonId);
    if (!exercise) return ctx.notFound();

    const choice = ctx.request.body?.choice;
    if (!Number.isInteger(choice) || choice < 0 || choice >= exercise.choices.length) {
      return ctx.badRequest('Choose an answer from the list.');
    }

    const correct = choice === exercise.answer;
    if (correct) {
      const studentId = ctx.state.user.id;
      const completionKey = studentId + ':' + lessonId;
      const now = new Date().toISOString();
      await strapi.db.connection('lesson_completions').insert({
        completion_key: completionKey,
        student_id: studentId,
        lesson_id: lessonId,
        created_at: now,
        updated_at: now,
      }).onConflict('completion_key').ignore();
    }

    ctx.body = { correct };
  },
};
