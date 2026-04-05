import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Load Google Maps API dynamically
function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (environment.googleMapsApiKey && environment.googleMapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        console.warn('Failed to load Google Maps API');
        resolve(); // Continue even if fails
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

loadGoogleMapsScript().then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
