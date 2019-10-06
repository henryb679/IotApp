// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  /* Firebase configuration */
  mqttConfig: {
    host: 'barretts.ecs.vuw.ac.nz',
    portNumber: 8883,
    topic: 'swen325/a3',
    clientId: 'baihenrconnection2345', // Must be different everytime it is run

    // hostname: "broker.mqttdashboard.com",
    // portNumber: 8000,
    // topic: 'swen325/a3',
    // clientId: 'clientId-MrgIT6WtvC', // Must be different everytime it is run
  }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
