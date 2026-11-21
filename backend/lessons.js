'use strict';

module.exports = [
  {
    content_name: 'What comes next?',
    subject: 'Mathematics',
    grade: 3,
    tutorial_text: 'Find the part of a pattern that repeats, then use it to predict what comes next.',
    video_path: '/lesson-media/patterns.mp4',
    checkpoint: {
      prompt: 'Circle, triangle, circle, triangle, circle. Which shape comes next?',
      choices: ['Circle', 'Triangle', 'Square'],
      answer: 1,
    },
  },
  {
    content_name: 'Count in fives',
    subject: 'Mathematics',
    grade: 3,
    tutorial_text: 'Count groups of five and use the rule to find the next number.',
    video_path: '/lesson-media/count-in-fives.mp4',
    checkpoint: {
      prompt: '5, 10, 15, 20. Which number comes next?',
      choices: ['21', '24', '25'],
      answer: 2,
    },
  },
];
