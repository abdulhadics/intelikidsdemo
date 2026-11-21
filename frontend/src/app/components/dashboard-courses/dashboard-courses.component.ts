import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { DashboardCoursesService, Lecture } from './dashboard-courses.service';

@Component({
  selector: 'app-dashboard-courses',
  templateUrl: './dashboard-courses.component.html',
  styleUrls: ['./dashboard-courses.component.css'],
})
export class DashboardCoursesComponent implements OnInit {
  readonly view = this.route.snapshot.data['view'] as 'dashboard' | 'courses' | 'progress';
  lectures: Lecture[] = [];
  completed = new Set<number>();
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private courses: DashboardCoursesService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';
    forkJoin({ lectures: this.courses.getCourses(), completed: this.courses.getCompletions() })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ({ lectures, completed }) => {
          this.lectures = lectures;
          this.completed = completed;
        },
        error: ({ status }) => {
          if (status === 401 || status === 403) {
            this.auth.signOut();
            return;
          }
          this.error = 'The lesson catalogue could not be loaded.';
        },
      });
  }

  get completedCount(): number {
    return this.lectures.filter(lecture => this.completed.has(lecture.id)).length;
  }
}
