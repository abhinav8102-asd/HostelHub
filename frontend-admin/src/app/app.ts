import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from './config/api.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'frontend';
  private http = inject(HttpClient);

  ngOnInit(): void {
    // Silent auto-warmup ping to Render backend as soon as app opens
    this.http.get(`${API_CONFIG.baseUrl}/health`).subscribe({
      next: () => console.log('⚡ Render backend auto-warmed up & ready!'),
      error: () => {
        // Retry once silently after 3 seconds if cold starting
        setTimeout(() => {
          this.http.get(`${API_CONFIG.baseUrl}/`).subscribe({
            next: () => console.log('⚡ Render backend warm-up retry success!'),
            error: (e) => console.log('Warmup ping:', e.message)
          });
        }, 3000);
      }
    });
  }
}
