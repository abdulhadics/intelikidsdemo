import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
  readonly teacherCmsUrl = environment.teacherCmsUrl;

  constructor(readonly auth: AuthService) {}
}
