import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DashboardCoursesService } from './dashboard-courses.service';

describe('DashboardCoursesService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  it('creates the service', () => {
    expect(TestBed.inject(DashboardCoursesService)).toBeTruthy();
  });
});
