/**
 * Load Google Maps JavaScript API once.
 * Key comes from VITE_GOOGLE_MAPS_API_KEY.
 */

type GoogleMapsWindow = Window & {
  google?: typeof google;
  __msyAdminGoogleMapsPromise?: Promise<typeof google>;
  gm_authFailure?: () => void;
  __msyAdminGoogleMapsCallback?: () => void;
};

function getApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key?.trim()) {
    throw new Error('Missing VITE_GOOGLE_MAPS_API_KEY in admin/.env');
  }
  return key.trim();
}

/**
 * Resolves when window.google.maps is ready.
 */
export function loadGoogleMaps(): Promise<typeof google> {
  const w = window as GoogleMapsWindow;

  if (w.google?.maps) {
    return Promise.resolve(w.google);
  }

  if (w.__msyAdminGoogleMapsPromise) {
    return w.__msyAdminGoogleMapsPromise;
  }

  const apiKey = getApiKey();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  w.__msyAdminGoogleMapsPromise = new Promise<typeof google>((resolve, reject) => {
    const fail = (message: string) => {
      w.__msyAdminGoogleMapsPromise = undefined;
      reject(new Error(message));
    };

    w.gm_authFailure = () => {
      fail(
        `Google Maps auth failed for ${origin}. ` +
          'Add this origin to API key HTTP referrers ' +
          '(e.g. http://localhost:3000/*), enable Maps JavaScript API, ' +
          'and confirm billing is linked on the Google Cloud project.'
      );
    };

    w.__msyAdminGoogleMapsCallback = () => {
      const g = (window as GoogleMapsWindow).google;
      if (!g?.maps) {
        fail('Google Maps callback ran but google.maps is missing');
        return;
      }
      resolve(g);
    };

    const script = document.createElement('script');
    script.id = 'msy-admin-google-maps-js';
    script.async = true;
    script.defer = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      '&v=weekly&callback=__msyAdminGoogleMapsCallback&loading=async';

    script.onerror = () => {
      fail('Failed to load Google Maps script (network or blocked).');
    };

    document.head.appendChild(script);
  });

  return w.__msyAdminGoogleMapsPromise;
}
