import { Component, OnInit } from '@angular/core';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { NativeRingtones } from '@ionic-native/native-ringtones/ngx';

@Component({
  selector: 'app-trace',
  templateUrl: './trace.page.html',
  styleUrls: ['./trace.page.scss'],
})
export class TracePage implements OnInit {

  id_plantation: any;
  id_contact: any;
  count: number = 0;

  startBtn: boolean = false;
  stopBtn: boolean = true;

  public backBtn = true;
  saveBtn = false;
  disableSave = false;

  traces: any[] = [];
  pathway: any[] = [];

  //coordx: any;
  //coordy: any;
  precision: any;
  subscription: any;
  plantation: any;
  id_company: any;
  id_project: any;
  id_task: any;
  user: any;

  timeout = 5000;

  car_color = 'danger';
  walker_color = 'danger';
  intervalId: number;

  walker_time: any;
  car_time: any;

  constructor(
    private storage: Storage,
    private db: DatabaseService,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private toastController: ToastController,
    private ringtones: NativeRingtones,
    public translate: TranslateService,
    private alertCtrl: AlertController,
    public loading: LoadingService,
    public navCtrl: NavController,
    private platform: Platform,
    private insomnia: Insomnia
  ) {
    this.getGPSPrecision();

    this.insomnia.keepAwake()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('id_contact').then((id_contact) => { this.id_contact = id_contact; });
      this.storage.get('id_task').then((id_task) => { this.id_task = id_task; });

      this.storage.get('id_plantation').then((val) => {
        this.db.getPlantation(val).then(plt => {
          this.plantation = plt;
        });
      });

      this.storage.get('id_project').then((id_project) => {
        this.id_project = id_project;
  
        this.db.getProject(id_project).then(project => {
          this.id_company = project.id_company;
        });
      });

      this.db.lastLogedUser().then(usr => {
        this.user = usr;
        this.walker_time = usr.walker_time;
        this.car_time = usr.car_time;
      });

      this.loadPreviousPoints();
    });
  }

  setTimeOut(conf) {
    if (conf == 'car') {
      this.timeout = this.car_time;
      this.car_color = 'success';
      this.walker_color = 'danger';
    } else {
      this.timeout = this.walker_time;
      this.car_color = 'danger';
      this.walker_color = 'success';
    }
  }

  loadPreviousPoints() {
    this.storage.get('id_plantation').then((val) => {
      this.id_plantation = val;
      this.loading.showLoader('Loading old points..');
      this.db.loadTracePoints(val, 0).then(_ => {
        this.db.getTracePoints().subscribe(data => {
          this.traces = data;
          this.loading.hideLoader();
        });

        if (this.traces.length != 0) {
          this.saveBtn = true;
        }
      });
    });
  }

  getGPSPrecision() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        this.subscription = this.geolocation.watchPosition().subscribe((data) => {
          this.precision = "";
          this.precision = Math.round(data.coords.accuracy * 100) / 100 + ' m';
        });
      });
  }

  start() {
    this.startBtn = true;
    this.stopBtn = false;

    this.backBtn = false;
    this.saveBtn = false;

    this.db.deleteAllTracePoints(this.id_plantation).then(_ => {
      this.translate.get('OLD_POINTS_DELETE_SUCCESS').subscribe(value => {
        this.toastAlert(value);
      });

      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
        () => {

          this.intervalId = window.setInterval(() => {

            if(this.count < 720) {
              this.geolocation.getCurrentPosition().then((resp) => {

                if ((resp.coords.longitude != null) && (resp.coords.latitude != null)
                  || (resp.coords.longitude != 0) && (resp.coords.latitude != 0)) {
  
                  var m = new Date();
                  let created_date = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2);
  
                  this.db.lastLogedUser().then(usr => {
                    let accuracy = Math.round(resp.coords.accuracy * 100) / 100;
                    this.db.addTracePoint(usr.id_contact, this.id_plantation, this.id_contact, resp.coords.longitude, resp.coords.latitude, created_date, 0, this.count, accuracy).then(_ => {
                      this.pathway.push([resp.coords.longitude, resp.coords.latitude]);
                      this.count = this.pathway.length + 1;
                    });
                  });
  
                } else {
                  this.translate.get('CHECK_YOUR_GPS').subscribe(value => {
                    this.presentAlert(value, 'Error');
                    this.stop();
                  });
                }
  
              }).catch(() => {
                this.translate.get('CHECK_YOUR_GPS').subscribe(value => {
                  this.presentAlert(value, 'Error');
                  this.stop();
                });
              });

            }  else {
              this.presentAlert('Vous avez atteint la limite qui est de 720 points.', 'Error');
              this.ringtones.getRingtone().then((ringtones) => { 
                console.log(ringtones); 
                this.ringtones.playRingtone('../../../assets/audio_file.mp3');
                this.ringtones.stopRingtone('../../../assets/audio_file.mp3');
              });

              this.stop();
            }
            
          }, this.timeout);

        },
        error => {
          console.log(error);
          this.translate.get('CHECK_YOUR_GPS').subscribe(value => {
            this.presentAlert(value, 'Error');
            this.stop();
          });
        }
      );

    });
  }

  async stop() {
    var yes, no, title, message;
    this.translate.get('YES').subscribe(value => { yes = value; });
    this.translate.get('NO').subscribe(value => { no = value; });
    this.translate.get('STOP_WAYPOINT_TITLE').subscribe(value => { title = value; });
    this.translate.get('STOP_WAYPOINT_MSG').subscribe(value => { message = value; });

    const promptAlert = await this.alertCtrl.create({
      subHeader: title,
      message: message,
      buttons: [
        {
          text: no,
          handler: data => {
            console.log(data);
          }
        },
        {
          text: yes,
          handler: data => {
            console.log(data);
            this.stopConfirm();
          }
        }
      ]
    });
    promptAlert.present();
  }

  stopConfirm() {
    this.startBtn = false;
    this.stopBtn = true;

    this.saveBtn = true;

    this.subscription.unsubscribe();
    clearInterval(this.intervalId);

    /*this.translate.get('WAY_POINT_STOP').subscribe(
      value => { this.toastAlert(value); }
    );*/

    this.insomnia.allowSleepAgain();
  }

  async presentAlert(message, title) {
    const alert = await this.alertCtrl.create({
      message: message,
      subHeader: title,
      buttons: ['OK']
    });
    alert.present();
  }

  async toastAlert(message) {
    let toast = this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());
  }

  save() {
    this.disableSave = true;
    this.loading.showLoader('Saving data...');

    let polylineFeature = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": this.pathway
      }
    };

    this.db.getNewContactId().then(contact => {

      var m = new Date();
      let created_date = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2);
      let path_name = contact.new_id + '-' + this.user.id_contact + '-' + this.id_plantation;

      this.db.addPath(contact.new_id, path_name, this.id_plantation, this.plantation.id_town, polylineFeature, this.user.id_contact, created_date, 0, this.id_company, this.id_contact)
        .then(() => {
          this.db.lastLogedUser().then(usr => {
            var m = new Date();
            let date = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2);

            this.geolocation.getCurrentPosition().then((resp) => {
              let json = polylineFeature.geometry;
              let newJson = JSON.stringify(json);
              let path_json = newJson.split(":").join("@");

              this.db.addTicker(usr.id_contact, this.id_plantation, this.plantation.plantationsite_id, this.id_contact, 'id_agent', this.user.id_contact, 'plantation_lines', date, resp.coords.latitude, resp.coords.longitude, null, this.id_project, this.id_task, null, null, null, null, null, this.id_company, null, null, contact.new_id, null);
              this.db.addTicker(usr.id_contact, this.id_plantation, this.plantation.plantationsite_id, this.id_contact, 'id_company', this.id_company, 'plantation_lines', date, resp.coords.latitude, resp.coords.longitude, null, this.id_project, this.id_task, null, null, null, null, null, this.id_company, null, null, contact.new_id, null);
              this.db.addTicker(usr.id_contact, this.id_plantation, this.plantation.plantationsite_id, this.id_contact, 'geom_json', path_json, 'plantation_lines', date, resp.coords.latitude, resp.coords.longitude, null, this.id_project, this.id_task, null, null, null, null, null, this.id_company, null, null, contact.new_id, null);
              this.db.addTicker(usr.id_contact, this.id_plantation, this.plantation.plantationsite_id, this.id_contact, 'modified_by', this.user.id_contact, 'plantation_lines', date, resp.coords.latitude, resp.coords.longitude, null, this.id_project, this.id_task, null, null, null, null, null, this.id_company, null, null, contact.new_id, null);
              this.db.addTicker(usr.id_contact, this.id_plantation, this.plantation.plantationsite_id, this.id_contact, 'modified_date', date, 'plantation_lines', date, resp.coords.latitude, resp.coords.longitude, null, this.id_project, this.id_task, null, null, null, null, null, this.id_company, null, null, contact.new_id, null);

              this.loading.hideLoader();
              this.db.saveTracePoint(this.id_plantation).then(() => {
                this.translate.get('PATH_SAVE_SUCCESS').subscribe(value => {
                  this.presentAlert(value, 'Success');
                  this.disableSave = false;
                });

                this.navCtrl.navigateBack(['/plantation-map']);
              });
            });
          });

          this.pathway = [];
        });
    });
  }

  async deletePoint(item) {
    var yes, no, title, message;
    this.translate.get('YES').subscribe(value => { yes = value; });
    this.translate.get('NO').subscribe(value => { no = value; });
    this.translate.get('DELETE_MEDIA_PP_TITLE').subscribe(value => { title = value; });
    this.translate.get('DELETE_MEDIA_PP_MSG').subscribe(value => { message = value; });

    const promptAlert = await this.alertCtrl.create({
      subHeader: title,
      message: message,
      buttons: [
        {
          text: no,
          handler: data => {
            console.log(data);
          }
        },
        {
          text: yes,
          handler: data => {
            console.log(data);
            this.deletePointConfirm(item);
          }
        }
      ]
    });
    promptAlert.present();
  }

  deletePointConfirm(item) {
    this.db.deleteTracePoint(item.id, this.id_plantation).then(_ => {

      this.translate.get('POINT_DELETED').subscribe(value => {
        this.toastAlert(value);
      });

      if (this.traces.length == 0) {
        this.saveBtn = false;
        this.startBtn = true;
        this.stopBtn = false;
      }
    });
  }

}
