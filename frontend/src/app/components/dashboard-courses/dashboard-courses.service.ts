import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LectureAttributes {
  content_name: string;
  tutorial_text: string;
  subject: string;
  grade: number;
  video_path: string;
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

@Injectable({ providedIn: 'root' })
export class DashboardCoursesService {
  constructor(private http: HttpClient) {}

  getCourses() {
    return this.http.get<{ data: LectureRecord[] }>(environment.apiUrl + 'contents?sort=id:asc')
      .pipe(map(({ data }) => data.map(({ id, attributes }) => ({ id, ...attributes }))));
  }

  getLecture(id: number) {
    return this.http.get<{ data: LectureRecord }>(environment.apiUrl + 'contents/' + id)
      .pipe(map(({ data }) => ({ id: data.id, ...data.attributes })));
  }

  getCompletions() {
    return this.http.get<{ completions: { lessonId: number }[] }>(environment.apiUrl + 'lesson-progress')
      .pipe(map(({ completions }) => new Set(completions.map(record => record.lessonId))));
  }

  getCheckpoint(id: number) {
    return this.http.get<Checkpoint>(environment.apiUrl + 'contents/' + id + '/checkpoint');
  }

  submitCheckpoint(id: number, choice: number) {
    return this.http.post<{ correct: boolean }>(environment.apiUrl + 'contents/' + id + '/checkpoint', { choice });
  }

  isDistracted(image: Blob) {
    const frame = new FormData();
    frame.append('image', image, 'frame.jpg');
    return this.http.post<{ result: FocusResult }>(environment.focusUrl, frame);
  }
}
