/**
 * Check out https://googlechromelabs.github.io/sw-toolbox/ for
 * more info on how to use sw-toolbox to custom configure your service worker.
 */

'use strict';
importScripts('./build/sw-toolbox.js');

self.toolbox.options.cache = {
  name: 'ionic-cache'
};

// pre-cache our key assets
self.toolbox.precache(
  [
    './build/main.js',
    './build/vendor.js',
    './build/main.css',
    './build/polyfills.js',
    'index.html',
    'manifest.json'
  ]
);

// dynamically cache any other local assets
self.toolbox.router.any('/*', self.toolbox.fastest);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;


function alertNotification() {
  self.registration.showNotification('Prolonged Inactivity Push Notification!', { body: 'There has been no motion in the house for the last 5 minutes' })
}

self.addEventListener('homePage', function(event){
  if(event.data == 'notification') {
    alertNotification();
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
    event.waitUntil(clients.matchAll({ type: 'window'}).then(function (clientList) {
        for (var i = 0; i < clientList.length; ++i) {
          console.log('List', clientList);
            var client = clientList[i];
            if (client.url == 'http://localhost:8100/') {
                client.postMessage('notificationClicked');
                return client.focus();
            }
        }
    }));
})