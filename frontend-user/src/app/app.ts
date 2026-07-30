import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'frontend';
  showSplash = true;
  splashFading = false;

  ngOnInit(): void {
    // Show splash animation on startup, then fade out smoothly
    setTimeout(() => {
      this.splashFading = true;
      setTimeout(() => {
        this.showSplash = false;
      }, 500); // 500ms fade transition
    }, 1800); // 1.8s splash logo duration
  }
}
