// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  apiPrefix: '/api',
  // BigDataCloud settings (set your API key here or via environment replacement)
  bigDataCloudApiKey: '',
  bigDataCloudUrl: 'https://api.bigdatacloud.net/data',
  // Razorpay settings
  razorpay: {
    keyId: 'rzp_test_SZExE9VRCy9pm2'
  },
  // Google Maps API Key - Replace with your actual API key
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
};
