import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Follow all', // Add this line to set the name of the extension
    content_scripts: [
      {
        matches: ['https://*.x.com/*', 'https://*.google.com/*'], // Allow content scripts on these domains
        js: ['content-scripts/content.js'], // Path to the built content script
      },
    ],
    host_permissions: [
      'https://x.com/*', // Allow access to all pages on x.com
      'https://*.google.com/*', // Allow access to all pages on google.com
    ],
    permissions: ['activeTab', 'storage'],  // Add any permissions needed for your functionality
  },
});
