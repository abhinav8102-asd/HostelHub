import 'zone.js'; // Import zone.js polyfill
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Auto-cleanup legacy localStorage keys from before namespace migration
// This prevents old 'token'/'user' keys from causing auth conflicts between portals
['token', 'user'].forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
  }
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
