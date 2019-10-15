import {Injectable} from '@angular/core';
import {environment} from "../../../enviroment/environment";
import {AlertController, Events} from 'ionic-angular';

/*
  Generated class for the MqttBrokerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

/**
 * Handles all the retrieval of data from the broker.
 */
@Injectable()
export class MqttBrokerProvider {

  private mqttStatus: string = 'Disconnected';
  private mqttClient: any = null;
  public message: any = '';
  private messageToSend: string = 'Type your message here.';
  private topic: string = environment.mqttConfig.topic;
  private clientId: string = environment.mqttConfig.clientId;


  // Stores the current battery level
  private currentBatteryLevel = {
    'living': undefined,
    'kitchen': undefined,
    'dining': undefined,
    'toilet': undefined,
    'bedroom': undefined,
  };

  // Stores the number of movements
  private noMovements = {
    'living': 0,
    'kitchen': 0,
    'dining': 0,
    'toilet': 0,
    'bedroom': 0,
  };

  private previousBatteryLevels = {
    'living': [],
    'kitchen': [],
    'dining': [],
    'toilet': [],
    'bedroom': [],
  }

  private timeStamps = [];

  private location: string = '';
  public lastTimeInMotion: Date = new Date();

  private inactiveTime;

  public flag: boolean = false;

  private numberOfOccurances = 0;

  /**
   * Constructor for MQTT broker service file.
   * @param events
   * @param alert
   */
  constructor(public events: Events, public alert: AlertController) {
    this.onMessageArrived = this.onMessageArrived.bind(this);
    this.connect();
  }

  /**
   * Connection specifications for connecting to the PAHO instance.
   */
  public connect() {
    this.mqttStatus = 'Connecting...';
    this.mqttClient = new Paho.MQTT.Client('localhost', 8883, '/mqtt', this.clientId);
    // this.mqttClient = new Paho.MQTT.Client('barretts.ecs.vuw.ac.nz', 8883, '/mqtt', this.clientId);

    // set callback handlers
    this.mqttClient.onConnectionLost = this.onConnectionLost;
    this.mqttClient.onMessageArrived = this.onMessageArrived;

    // connect the client
    console.log('Connecting to mqtt via websocket');
    this.mqttClient.connect({timeout: 10, useSSL: false, onSuccess: this.onConnect, onFailure: this.onFailure});
  }

  /**
   * Disconnects the instance of the service when needed.
   * Has not been implement but can be easily done via
   * the implementation of a delete button in one of the files.
   */
  public disconnect() {
    if (this.mqttStatus == 'Connected') {
      this.mqttStatus = 'Disconnecting...';
      this.mqttClient.disconnect();
      this.mqttStatus = 'Disconnected';
    }
  }

  /**
   * Sends a message that should be published on the broker side.
   * Has not been implemented in this current configuration.
   */
  public sendMessage() {
    if (this.mqttStatus == 'Connected') {
      this.mqttClient.publish(this.topic, this.messageToSend);
    }
  }

  /**
   * Connect to the broker and subscribes to the set topic.
   */
  public onConnect = () => {
    console.log('Connected');
    this.mqttStatus = 'Connected';

    // subscribes to the specific message
    this.mqttClient.subscribe(this.topic);
  }

  /**
   * If a failure exists, it will console log the issue.
   * @param responseObject
   */
  public onFailure = (responseObject) => {
    console.log('Failed to connect');
    this.mqttStatus = 'Failed to connect';
  }

  /**
   * If the connection is lost, it will console log the issue.
   * @param responseObject
   */
  public onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      this.mqttStatus = 'Disconnected';
    }
  }

  /**
   * When messages are arrived, they are further handled in the parseMessages function.
   * @param message
   */
  public onMessageArrived = (message) => {
    this.events.publish("messages", message.payloadString);

    this.parseMessages(message.payloadString);
    this.message = message;
  }

  /**
   * Parses the messages to get the following
   *  - current time stamp
   *  - sensor location
   *  - motion status - if the patient is in that room/not
   *  - current battery status
   * @param message
   */
  public parseMessages(message) {
    // console.log(message);

    let messageArray = message.split(',');

    let currentTimestamp = messageArray[0];
    let sensorLocation: string = messageArray[1];
    let motionStatus = messageArray[2];
    let batteryStatus = messageArray[3];

    this.timeStamps.push(currentTimestamp);

    // Gets the last time the user was inactive
    this.inactiveTime = this.calculateLastSeenTime(this.lastTimeInMotion);
    this.getAlert();

    // If a motion has taken place, then track the time respective of that.
    if (motionStatus == '1') {
      this.lastTimeInMotion = new Date(currentTimestamp);
    }

    // console.log(this.previousBatteryLevels.living);

    if (sensorLocation == 'living') {
      this.currentBatteryLevel.living = batteryStatus;
      this.previousBatteryLevels.living.push(batteryStatus);
      //tracks current location
      if (motionStatus == '1') {
        this.location = sensorLocation;
        this.noMovements.living++;
      }
    }

    if (sensorLocation == 'kitchen') {
      this.currentBatteryLevel.kitchen = batteryStatus;
      this.previousBatteryLevels.kitchen.push(batteryStatus);

      //tracks current location
      if (motionStatus == '1') {
        this.location = sensorLocation;
        this.noMovements.kitchen++;
      }
    }

    if (sensorLocation == 'dining') {
      this.currentBatteryLevel.dining = batteryStatus;
      this.previousBatteryLevels.dining.push(batteryStatus);

      //tracks current location
      if (motionStatus == '1') {
        this.location = sensorLocation;
        this.noMovements.dining++;
      }
    }

    if (sensorLocation == 'toilet') {
      this.currentBatteryLevel.toilet = batteryStatus;
      this.previousBatteryLevels.toilet.push(batteryStatus);

      //tracks current location
      if (motionStatus == '1') {
        this.location = sensorLocation;
        this.noMovements.toilet++;
      }
    }
    
    if (sensorLocation == 'bedroom') {
      this.currentBatteryLevel.bedroom = batteryStatus;
      this.previousBatteryLevels.bedroom.push(batteryStatus);

      //tracks current location
      if (motionStatus == '1') {
        this.location = sensorLocation;
        this.noMovements.bedroom++;
      }
    }

  }

  /**
   * Gets all the previous time stamps
   */
  public getAllTimeStamps(){
    return this.timeStamps;
  }

  /**
   * Gets the time since the last motion.
   */
  public getTimeSinceLastMotion() {
    return this.lastTimeInMotion;
  }

  /**
   * Calculates the time difference between the time that the last motion took
   * place and the current time.
   */
  public calculateLastSeenTime = (startDate) => {
    let timeDifference = new Date().getTime() - startDate.getTime();

    return (timeDifference / 60000).toFixed(2);
  };

  /**
   * Gets the raw data of the message.
   */
  public getData() {
    return this.message;
  }

  /**
   * Gets the current battery level of each room.
   */
  public getBatteryLevel() {
    return this.currentBatteryLevel;
  }

  /**
   * Gets the last seen location of the patient
   */
  public lastSeenLocation() {
    return this.location;
  }

  /**
   * Gets the total number of movements for each room.
   */
  public movements() {
    return this.noMovements;
  }

  public getPreviousBatteryLevels(){
    return this.previousBatteryLevels;
  }

  /**
   * Gets the alert message and shows it if the condition is met
   * if no motion has occurred for 5mins - it should alert back to the user.
   */
  getAlert() {
    if (this.inactiveTime >= 1 && !this.flag) {
      this.numberOfOccurances += 1;
    }

    if (this.numberOfOccurances === 1 && !this.flag) {
      let alert = this.alert.create({
        title: 'Prolonged Inactivity Push Notification',
        message: 'There has been no motion in the house for the last 5 minutes',
        buttons: ['OK']
      });
      alert.present();
      this.flag = true;

      alert.onDidDismiss(() => {
        this.flag = false;

        // Once the alert is dismissed, the app refers the user back to the home page.
        this.events.publish("homePage", 'alertMade');
        this.numberOfOccurances = 0;
      })
    }
  }
}
