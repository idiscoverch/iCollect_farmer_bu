import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { TranslateService } from '@ngx-translate/core';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LoadingService } from 'src/app/services/loading.service';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { NetworkService, ConnectionStatus } from 'src/app/services/network.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  pages: any;

  public avatar: string;
  public FullName: string;
  public Company: string;

  user: any;
  selectedPath = "";

  constructor(
    public navCtrl: NavController,
    private transfer: FileTransfer,
    private router: Router,
    private file: File,
    private webview: WebView,
    private db: DatabaseService,
    public loading: LoadingService,
    private alertCtrl: AlertController,
    private networkService: NetworkService,
    private toastController: ToastController,
    public translate: TranslateService
  ) {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event && event.url) {
        this.selectedPath = event.url;
      }
    });
  }

  ngOnInit() {
    this.db.lastLogedUser().then(usr => {
      this.user = usr;

      this.file.checkDir(this.file.externalRootDirectory, 'icollect_bu/avatar').then(_ => {
        let link = this.file.externalRootDirectory + 'icollect_bu/avatar/' + this.user.id_contact + '.jpg';
        this.file.checkFile(this.file.externalRootDirectory + 'icollect_bu/avatar/', this.user.id_contact + '.jpg').then(_ => {
          this.avatar = this.webview.convertFileSrc(link);
        }).catch(_ => {
          this.avatar = '../assets/user.png';
        });
      }); 

      this.FullName = this.user.name;
      this.Company = this.user.company_name;

      var project_list, contact_list, field_mapping, location, settings;

      this.translate.get('MENU_PROJECT_LIST').subscribe(value => { project_list = value; });
      this.translate.get('MENU_CONTACT_LIST').subscribe(value => { contact_list = value; });
      this.translate.get('MENU_FIELD_MAPPING').subscribe(value => { field_mapping = value; });
      this.translate.get('MENU_LOCATION').subscribe(value => { location = value; });
      this.translate.get('MENU_SETTNGS').subscribe(value => { settings = value; });

      this.pages = [
        {
          title: project_list,
          url: '/menu/project-list',
          icon: 'home'
        },  
        { 
          title: contact_list,
          url: '/menu/contacts',
          icon: 'people'
        },
        {
          title: field_mapping,
          url: '/menu/field-mapping',
          icon: 'map'
        },
        {
          title: location,
          url: '/menu/location',
          icon: 'list'
        },
        {
          title: settings,
          url: '/menu/settings',
          icon: 'settings'
        }
      ];
    }); 
  }

  logout() {
    this.db.logOut(this.user.id_contact).then(_ => {
      this.db.syncData(this.user.id_contact).then(() => {
        this.backup();

      }).catch(() =>{
        this.loginPage();
      });
    });
  }

  loginPage() {
    let data = {
      lang: this.user.lang,
      username: this.user.username,
      password: atob(this.user.pass_value)
    };

    this.navCtrl.navigateRoot(['login', data]);
  }

  backup() {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status == ConnectionStatus.Online) {
        this.translate.get('UPLOADING_DB').subscribe(value => {
          this.loading.showLoader(value);
        });

        this.file.checkFile(this.file.applicationStorageDirectory + 'databases/', 'icollect_2.0.8.db').then((files) => {
          let dbURL = encodeURI(this.file.applicationStorageDirectory + 'databases/icollect_2.0.8.db');

          let m = new Date();
          let timestamp = m.getUTCFullYear() + "-" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + m.getUTCDate()).slice(-2) + "_" + ("0" + m.getUTCHours()).slice(-2) + "." + ("0" + m.getUTCMinutes()).slice(-2) + "." + ("0" + m.getUTCSeconds()).slice(-2);
          let filename = 'IF-' + this.user.id_contact + "_" + timestamp + ".db";

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

              this.loginPage();
              this.loading.hideLoader();

            }, (err) => {
              console.log(err);
              this.loading.hideLoader();

              this.translate.get('BACKUP_DB_ERROR').subscribe(
                value => { this.presentAlert(value, 'Error'); }
              );

              this.loginPage();
            });

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

  async toastAlert(message) {
    let toast = this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());
  }

  async presentAlert(message, title) {
    const alert = await this.alertCtrl.create({
      message: message,
      subHeader: title,
      buttons: ['OK']
    });
    alert.present();
  }

}
