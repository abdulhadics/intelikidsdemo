import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { catchError, EMPTY, exhaustMap, Observable, of, Subscription, switchMap, timeout, timer } from 'rxjs';
import { DashboardCoursesService, FocusResult } from '../../dashboard-courses.service';

type CameraStatus = FocusResult | 'off' | 'paused' | 'starting' | 'checking' | 'camera-error' | 'service-error';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
})
export class VideoPlayerComponent implements OnDestroy {
  @Input() videoSource = '';
  get posterUrl(): string | null {
    const video = new URL(this.videoSource, window.location.origin);
    return video.pathname.startsWith('/lesson-media/') ? this.videoSource.replace(/\.mp4$/, '.jpg') : null;
  }
  @ViewChild('lesson', { static: true }) lesson!: ElementRef<HTMLVideoElement>;

  cameraEnabled = false;
  videoError = false;
  status: CameraStatus = 'off';
  readonly labels: Record<CameraStatus, string> = {
    off: 'Camera off',
    paused: 'Camera off while paused',
    starting: 'Waiting for camera',
    checking: 'Checking focus',
    focused: 'Focused',
    distracted: 'Distracted',
    unavailable: 'Face or eyes out of view',
    'camera-error': 'Camera unavailable. Check your camera permissions and try again.',
    'service-error': 'Focus service unavailable. The lesson can still play.',
  };

  private generation = 0;
  private stream?: MediaStream;
  private camera?: HTMLVideoElement;
  private sampler?: Subscription;

  constructor(private courses: DashboardCoursesService) {}

  toggleCamera(): void {
    this.cameraEnabled = !this.cameraEnabled;
    if (!this.cameraEnabled) {
      this.stopCamera();
      this.status = 'off';
      return;
    }
    if (this.lesson.nativeElement.paused) {
      this.status = 'paused';
      return;
    }
    void this.onPlay();
  }

  async onPlay(): Promise<void> {
    if (!this.cameraEnabled || this.stream || this.status === 'starting') return;

    const generation = ++this.generation;
    this.status = 'starting';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (this.generation !== generation) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const camera = document.createElement('video');
      camera.muted = true;
      camera.playsInline = true;
      camera.srcObject = stream;
      this.camera = camera;
      this.stream = stream;

      stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (this.generation === generation) this.cameraFailed();
      }, { once: true }));

      await camera.play();
      if (this.generation === generation) this.startSampling(camera);
    } catch {
      if (this.generation === generation) this.cameraFailed();
    }
  }

  onPause(): void {
    this.stopCamera();
    this.status = this.cameraEnabled ? 'paused' : 'off';
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  private startSampling(camera: HTMLVideoElement): void {
    const canvas = document.createElement('canvas');
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    const context = canvas.getContext('2d');
    if (!context || !canvas.width || !canvas.height) {
      this.cameraFailed();
      return;
    }

    this.status = 'checking';
    this.sampler = timer(0, 1000).pipe(
      exhaustMap(() => {
        context.drawImage(camera, 0, 0, canvas.width, canvas.height);
        return new Observable<Blob | null>(subscriber => {
          canvas.toBlob(blob => {
            subscriber.next(blob);
            subscriber.complete();
          }, 'image/jpeg', 0.8);
        }).pipe(
          switchMap(blob => blob ? this.courses.isDistracted(blob) : EMPTY),
          timeout(5000),
          catchError(() => of({ result: 'service-error' as const })),
        );
      }),
    ).subscribe(({ result }) => this.status = result);
  }

  private cameraFailed(): void {
    this.stopCamera();
    this.cameraEnabled = false;
    this.status = 'camera-error';
  }

  private stopCamera(): void {
    this.generation++;
    this.sampler?.unsubscribe();
    this.sampler = undefined;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = undefined;
    if (this.camera) this.camera.srcObject = null;
    this.camera = undefined;
  }
}
