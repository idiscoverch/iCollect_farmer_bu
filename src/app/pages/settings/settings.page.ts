import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertController, ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Storage } from '@ionic/storage';
import { CacheService } from "ionic-cache";
import { NavController } from '@ionic/angular';
import { NetworkService, ConnectionStatus } from 'src/app/services/network.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public avatar: string;
  lang: string;

  contact_data_date: string; contact_data = false;
  plantation_data_date: string; plantation_data = false;
  backup_data_date: string; backup_data = false;
  image_data_date: string; image_data = false;
  document_data_date: string; document_data = false;
  downAvatar_data_date: string; downAvatar_data = false;

  walker_time: any;
  car_time: any;

  public high_accuracy_value: boolean;
  user: any;
  search_type: any;
  //file_type: any = "sqlite";

  constructor(
    public loading: LoadingService,
    public translate: TranslateService,
    private alertCtrl: AlertController,
    private transfer: FileTransfer,
    public navCtrl: NavController,
    private db: DatabaseService,
    private storage: Storage,
    public cache: CacheService,
    private networkService: NetworkService,
    private toastController: ToastController,
    private geolocation: Geolocation,
    private backgroundMode: BackgroundMode,
    private file: File
  ) {
    this.storage.clear();
    this.cache.clearAll();

    this.db.createIcollectDir();
    this.db.createDataDir();
  }

  ngOnInit() {
    this.db.lastLogedUser().then(usr => {
      this.user = usr;
      this.lang = usr.lang;
      this.search_type = usr.search_type;
      this.walker_time = usr.walker_time / 1000;
      this.car_time = usr.car_time / 1000;

      if (this.user.high_accuracy == 1) { this.high_accuracy_value = true; } else { this.high_accuracy_value = false; }
    });

    this.loadDataInfos();
  }

  loadDataInfos() {
    this.db.lastAVATARdownloadData().then(data => {
      this.downAvatar_data_date = data.data_date;
      this.downAvatar_data = true;
    });

    this.db.lastBackupData().then(data => {
      this.backup_data_date = data.data_date;
      this.backup_data = true;
    });

    this.db.lastPlantationData().then(data => {
      this.plantation_data_date = data.data_date;
      this.plantation_data = true;
    });

    this.db.lastContactData().then(data => {
      this.contact_data_date = data.data_date;
      this.contact_data = true;
    });
  }

  createAvatarDir() {
    this.file.checkDir(this.file.externalRootDirectory, 'icollect_bu/avatar').then(response => {
      console.log(response);
    }).catch(err => {
      console.log(err);
      this.file.createDir(this.file.externalRootDirectory, 'icollect_bu/avatar', false).then(response => {
        console.log('Directory create' + response);

      }).catch(err => { console.log('Directory no create' + JSON.stringify(err)); });
    });
  }

  createDocumentsDir() {
    this.file.checkDir(this.file.externalRootDirectory, 'icollect_bu/documents').then(response => {
      console.log(response);
    }).catch(err => {
      console.log(err);
      this.file.createDir(this.file.externalRootDirectory, 'icollect/documents', false).then(response => {
        console.log('Directory create' + response);

      }).catch(err => { console.log('Directory no create' + JSON.stringify(err)); });
    });
  }

  restFetchRegvalues() {
    this.navCtrl.navigateForward(['/download-list', 'regvalues']);
  }

  restFetchTowns() {
    this.navCtrl.navigateForward(['/download-list', 'towns']);
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

  localUpdate() {
    this.navCtrl.navigateForward(['/download-list', 'settings']);
  }

  reSyncPoly() {
    this.db.getAllMobilePolygons().then(() => {
      this.db.getMobilePolygons().subscribe(data => {

        var i = 1;
        data.forEach((item, index) => {
          console.log(item); //value
          console.log(index); //index

          var data = JSON.parse(item.geom_json);

          this.geolocation.getCurrentPosition().then((resp) => {
            var m = new Date();
            let date = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2);

            let json: any = {
              "type": "MultiPolygon",
              "coordinates": data.geometry.coordinates
            };

            let json_string = JSON.stringify(json);
            let geom_json = json_string.split(":").join("@");

            this.db.addTicker(this.user.id_contact, item.id_plantation, item.plantationsite_id, item.id_contact, 'geom_json', geom_json, 'plantation', date, resp.coords.latitude, resp.coords.longitude, item.id_plantation, null, null, null, null, null, null, null, null, null, null, null, null)
              .then(() => {
                if (item.length == i) {
                  this.translate.get('DATA_READY_FOR_SYNC').subscribe(
                    value => { this.presentAlert(value, 'Success'); }
                  );
                }
              });
          });

          i = i + 1;
        });

      });
    });
  }

  downloadAvatars() {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status == ConnectionStatus.Online) {
        this.createAvatarDir();
        this.navCtrl.navigateBack(['/download-avatar']);
      }

      if (status == ConnectionStatus.Offline) {
        this.toastAlert('Check Your internet connection before.');
      }

    });

  }

  /* fileType(type) {
    this.file_type = type;
  } */

  backup() {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status == ConnectionStatus.Online) {
        this.translate.get('UPLOADING_DB').subscribe(value => {
          this.loading.showLoader(value);
        });

        this.file.checkFile(this.file.applicationStorageDirectory + 'databases/', 'icollect_2.0.8.db').then(() => {

          let m = new Date();
          let timestamp = m.getUTCFullYear() + "-" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + m.getUTCDate()).slice(-2) + "_" + ("0" + m.getUTCHours()).slice(-2) + "." + ("0" + m.getUTCMinutes()).slice(-2) + "." + ("0" + m.getUTCSeconds()).slice(-2);
          
          setTimeout(() => {
            let filename_db = 'IF-' + this.user.id_contact + "_" + timestamp + ".db";
            let dbURL = encodeURI(this.file.applicationStorageDirectory + 'databases/icollect_2.0.8.db');
            this.sendBackup(filename_db, dbURL);
          }, 3000);



          /* let dbURL, filename;
          if (this.file_type == "sqlite") {
            filename = 'IF-' + this.user.id_contact + "_" + timestamp + ".db";
            dbURL = encodeURI(this.file.applicationStorageDirectory + 'databases/icollect_2.0.8.db');
            this.sendBackup(filename, dbURL);

          } else {
            var zip = new JSZip();
            filename = 'IF-' + this.user.id_contact + "_" + timestamp + ".zip";
            zip.file(this.file.applicationStorageDirectory + 'databases/icollect_2.0.8.db', filepath + filename);
            zip.generateAsync({ type: "string" }).then((content) => { alert(content);
              //dbURL = filepath + filename;  
              //zip.saveAs(content, filename);
              this.sendBackup(filename, content);

              /*setTimeout(() => {
                this.file.checkFile(filepath, filename).then(file => { alert(file);
                  this.sendBackup(filename, dbURL);
                }).catch(err => alert(JSON.stringify(err)));
              }, 30000); 
              
            });
          } */

        }).catch((err) => {
          console.log(err);
          this.loading.hideLoader();
        });
      }

      if (status == ConnectionStatus.Offline) {
        this.translate.get('CHECK_INTERNET').subscribe(value => {
          this.toastAlert(value);
        });
      }
    });
  }


  sendBackup(filename, dbURL) {
    this.backgroundMode.enable();

    //setTimeout(() => {
    let filepath = this.file.externalRootDirectory + 'icollect_bu/data/';
    this.file.copyFile(this.file.applicationStorageDirectory + 'databases/', 'icollect_2.0.8.db', filepath, filename);

    let url = encodeURI("https://icoop.live/ic/mobile_upload.php?func=database");

    let options: FileUploadOptions = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': filename, 'func': 'database' }
    }

    const fileTransfer: FileTransferObject = this.transfer.create();

    fileTransfer.upload(dbURL, url, options, true)
      .then((data) => {
        console.log(data);

        this.translate.get('BACKUP_DB_SUCCESS').subscribe(
          value => { this.presentAlert(value, 'Success'); }
        );

        var m = new Date();
        let timestamp = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2);
        this.db.addData('backup', timestamp, null, 1, null);

        this.loadDataInfos();
        this.loading.hideLoader();

      }, (err) => {

        console.log(err);
        this.loading.hideLoader();

        this.translate.get('BACKUP_DB_ERROR').subscribe(
          value => { this.presentAlert(value, 'Error'); }
        );
      });

    //}, 10000);
  }

  uploadContactDocs() {
    let data = { dataType: 'contact' }
    this.navCtrl.navigateForward(['/sync', data]);
  }

  uploadPlantationDocs() {
    let data = { dataType: 'plantation' }
    this.navCtrl.navigateForward(['/sync', data]);
  }

  uploadLocationDocs() {
    let data = { dataType: 'location' }
    this.navCtrl.navigateForward(['/sync', data]);
  }

  notSyncList() {
    let data = { dataType: 'local_data' }
    this.navCtrl.navigateForward(['/sync', data]);
  }


  async deleteDatabase() {
    var yes, no, title, msg;
    this.translate.get('YES').subscribe(value => { yes = value; });
    this.translate.get('NO').subscribe(value => { no = value; });
    this.translate.get('DELETE_LOCAL_DB_PP_TITLE').subscribe(value => { title = value; });
    this.translate.get('DELETE_LOCAL_DB_PP_MSG').subscribe(value => { msg = value; });

    let promptAlert = await this.alertCtrl.create({
      message: msg,
      subHeader: title,
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
            this.deleteDatabaseConfirm();
          }
        }
      ]
    });
    promptAlert.present();
  }

  deleteDatabaseConfirm() {
    this.backup();

    setTimeout(() => {
      this.db.deleteAllData().then(_ => {
        this.db.deleteUserTable();
      });
    }, 3500);
  }

  changeLanguage(lang) {
    this.db.updateLang(this.user.id_contact, lang).then(_ => {
      this.translate.use(lang);
    });
  }

  searchType(search_type) {
    this.db.updateSearchType(search_type, this.user.id_contact).then(_ => {
      this.translate.get('SUCCESSFULLY_UPDATED').subscribe(value => {
        this.toastAlert(value);
      });
    });
  }

  changeAccuracy() {
    var high_accuracy;
    if (this.high_accuracy_value == true) {
      high_accuracy = 1;
    } else { high_accuracy = 0; }

    this.db.updateAccuracy(high_accuracy, this.user.id_contact).then(_ => {
      this.translate.get('ACCURACY_UPDATE').subscribe(value => {
        this.presentAlert(value, 'Success');
      });
    });
  }

  saveWalkerTime() {
    if (this.walker_time >= 10) {
      let walker_time = this.walker_time * 1000;
      this.db.updateUserWalkerTime(this.user.id_contact, walker_time).then(() => {
        this.translate.get('SUCCESSFULLY_UPDATED').subscribe(value => {
          this.presentAlert(value, 'Success');
        });
      });

    } else {
      this.presentAlert('La valeur minimale est de 5 secondes', 'Info');
    }
  }

  saveCarTime() {
    if (this.car_time >= 5) {
      let car_time = this.car_time * 1000;
      this.db.updateUserCarTime(this.user.id_contact, car_time).then(() => {
        this.translate.get('SUCCESSFULLY_UPDATED').subscribe(value => {
          this.presentAlert(value, 'Success');
        });
      });

    } else {
      this.presentAlert('La valeur minimale est de 10 secondes', 'Info');
    }
  }

}
