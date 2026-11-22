import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LectureAttributes {
  content_name: string;
  tutorial_text: string;
  subject: string;
  grade: number;
  videoUrl: string | null;
  hasCheckpoint: boolean;
}

interface LectureRecord {
  id: number;
  attributes: LectureAttributes;
}

export interface Lecture extends LectureAttributes {
  id: number;
}

export interface Checkpoint {
  prompt: string;
  choices: string[];
  completed: boolean;
}

export type FocusResult = 'focused' | 'distracted' | 'unavailable';

interface DemoLesson extends Omit<LectureAttributes, 'videoUrl' | 'hasCheckpoint'> {
  video_path: string;
  checkpoint: Omit<Checkpoint, 'completed'> & { answer: number };
}

const progressKey = 'intellikids-preview-progress';

@Injectable({ providedIn: 'root' })
export class DashboardCoursesService {
  constructor(private http: HttpClient) {}

  private readonly demoLessons = this.http.get<DemoLesson[]>('/assets/demo-lessons.json').pipe(shareReplay(1));

  private demoLecture(lesson: DemoLesson, index: number): Lecture {
    const { checkpoint, video_path, ...attributes } = lesson;
    return { id: index + 1, ...attributes, videoUrl: video_path, hasCheckpoint: !!checkpoint };
  }

  private demoProgress(): Set<number> {
    return new Set<number>(JSON.parse(sessionStorage.getItem(progressKey) || '[]'));
  }

  getCourses() {
    if (environment.isStudentPreview) return this.demoLessons.pipe(map(lessons => lessons.map(this.demoLecture)));
    return this.http.get<{ data: LectureRecord[] }>(environment.apiUrl + 'contents?sort=id:asc')
      .pipe(map(({ data }) => data.map(this.toLecture)));
  }

  getLecture(id: number) {
    if (environment.isStudentPreview) return this.demoLessons.pipe(map(lessons => this.demoLecture(lessons[id - 1], id - 1)));
    return this.http.get<{ data: LectureRecord }>(environment.apiUrl + 'contents/' + id)
      .pipe(map(({ data }) => this.toLecture(data)));
  }

  private toLecture({ id, attributes }: LectureRecord): Lecture {
    const { videoUrl } = attributes;
    return {
      id,
      ...attributes,
      videoUrl: videoUrl?.startsWith('/') ? environment.mediaOrigin + videoUrl : videoUrl,
    };
  }

  getCompletions() {
    if (environment.isStudentPreview) return of(this.demoProgress());
    return this.http.get<{ completions: { lessonId: number }[] }>(environment.apiUrl + 'lesson-progress')
      .pipe(map(({ completions }) => new Set(completions.map(record => record.lessonId))));
  }

  getCheckpoint(id: number) {
    if (environment.isStudentPreview) {
      return this.demoLessons.pipe(map(lessons => {
        const { prompt, choices } = lessons[id - 1].checkpoint;
        return { prompt, choices, completed: this.demoProgress().has(id) };
      }));
    }
    return this.http.get<Checkpoint>(environment.apiUrl + 'contents/' + id + '/checkpoint');
  }

  submitCheckpoint(id: number, choice: number) {
    if (environment.isStudentPreview) {
      return this.demoLessons.pipe(map(lessons => {
        const correct = lessons[id - 1].checkpoint.answer === choice;
        if (correct) {
          const completed = this.demoProgress();
          completed.add(id);
          sessionStorage.setItem(progressKey, JSON.stringify([...completed]));
        }
        return { correct };
      }));
    }
    return this.http.post<{ correct: boolean }>(environment.apiUrl + 'contents/' + id + '/checkpoint', { choice });
  }

  isDistracted(image: Blob) {
    const frame = new FormData();
    frame.append('image', image, 'frame.jpg');
    return this.http.post<{ result: FocusResult }>(environment.focusUrl, frame);
  }
}
