import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { Checkpoint, DashboardCoursesService, Lecture } from '../dashboard-courses.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
})
export class CourseListComponent implements OnInit {
  lecture: Lecture | null = null;
  checkpoint: Checkpoint | null = null;
  choice: number | null = null;
  feedback = '';
  saving = false;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private courses: DashboardCoursesService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadLecture();
  }

  loadLecture(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.loading = false;
      this.error = 'This lesson could not be found.';
      return;
    }

    this.loading = true;
    this.error = '';
    forkJoin({ lecture: this.courses.getLecture(id), checkpoint: this.courses.getCheckpoint(id) })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ({ lecture, checkpoint }) => {
          this.lecture = lecture;
          this.checkpoint = checkpoint;
        },
        error: ({ status }) => {
          if (status === 401 || status === 403) {
            this.auth.signOut();
            return;
          }
          this.error = status === 404
            ? 'This lesson could not be found.'
            : 'The lesson service is unavailable. Try again.';
        },
      });
  }

  submitCheckpoint(): void {
    const { lecture, checkpoint, choice } = this;
    if (!lecture || !checkpoint || checkpoint.completed || choice === null || this.saving) return;

    this.feedback = '';
    this.saving = true;
    this.courses.submitCheckpoint(lecture.id, choice)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: ({ correct }) => {
          checkpoint.completed = correct;
          this.feedback = correct
            ? 'Correct! This lesson is marked complete.'
            : 'Try again. Replay the example if you need a hint.';
        },
        error: ({ status }) => {
          if (status === 401 || status === 403) {
            this.auth.signOut();
            return;
          }
          this.feedback = 'Your answer could not be saved. Try again.';
        },
      });
  }
}
