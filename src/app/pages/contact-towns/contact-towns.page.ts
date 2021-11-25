import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-contact-towns',
  templateUrl: './contact-towns.page.html',
  styleUrls: ['./contact-towns.page.scss'],
})
export class ContactTownsPage implements OnInit {

  towns: any[] = [];
  public searchTerm: string = "";
  spinner = false;

  id_contact: any;
  created_date: any;
  agent_id: any;
  id_project: any;
  id_task: any;
  id_company: any;

  coordx: any;
  coordy: any;

  results: any = "";

  constructor(
    public translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
    private db: DatabaseService,
    public loading: LoadingService,
    public navCtrl: NavController,
    private storage: Storage,
    private alertCtrl: AlertController
  ) {
    this.storage.get('id_project').then((val) => { this.id_project = val; });
    this.storage.get('id_task').then((val) => { this.id_task = val; });
  }

  ngOnInit() {
    this.id_contact = this.activatedRoute.snapshot.paramMap.get('id_contact');

    var m = new Date();
    this.created_date = m.getUTCFullYear() + "/" + ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" + ("0" + m.getUTCDate()).slice(-2) + " " + ("0" + m.getUTCHours()).slice(-2) + ":" + ("0" + m.getUTCMinutes()).slice(-2) + ":" + ("0" + m.getUTCSeconds()).slice(-2);

    this.db.lastLogedUser().then(usr => {
      this.agent_id = usr.id_contact;
    });

    this.db.getProject(this.id_project).then(prj => {
      this.id_company = prj.id_company;
    });

    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.db.lastLogedUser().then(usr => {
            this.coordx = resp.coords.latitude;
            this.coordy = resp.coords.longitude;
          });

        }).catch((error) => {
          this.translate.get('LOCATION_ERROR').subscribe(value => {
            this.presentAlert(value + error, 'Error');
          });
        });
      }, error => console.log(error));
  }

  searchFromTown() { 
    this.spinner = true;
    
    this.towns = [];
    this.db.searchTowns(this.searchTerm).then(() => {
      this.db.getTowns().subscribe(data => { 
        if(data == []) {
          this.results = 'Aucun résultat.';
        } else {
          this.towns = data;
          this.results = "";
        }

        this.spinner = false;
      });

    }).catch(err => { 
      console.log(err);
      this.spinner = false;
      this.presentAlert('Please download towns in settings page before.', 'Error');
    });
  }

  async itemTown(item) {
    var text, save, cancel;
    this.translate.get('SAVE_MSG').subscribe(value => { text = value; });
    this.translate.get('SAVE').subscribe(value => { save = value; });
    this.translate.get('CANCEL').subscribe(value => { cancel = value; });

    const alert = await this.alertCtrl.create({
      message: text,
      buttons: [
        {
          text: cancel,
          role: 'cancel',
          handler: data => {
            console.log(data);
            this.back();
          }
        },
        {
          text: save,
          handler: data => {
            console.log(data);
            this.save(item);
          }
        }
      ]
    });
    alert.present();
  }

  save(item) {
    this.db.saveContactTown(item.town_name, item.gid_town, this.id_contact).then(() => {
      this.saveTicker('town_name', item.town_name);
      this.saveTicker('id_town', item.gid_town);
      this.saveTicker('modified_date', this.created_date);
      this.saveTicker('modified_by', this.agent_id);

      this.translate.get('CONTACT_SAVE_SUCCES').subscribe(value => {
        this.presentAlert(value, 'Success').then(() => {
          this.back();
        });
      });
    });
  }

  saveTicker(field_name, field_value) {
    this.db.addTicker(this.agent_id, null, null, this.id_contact, field_name, field_value, 'contact', this.created_date, this.coordx, this.coordy, this.id_contact, this.id_project, this.id_task, null, null, null, null, null, this.id_company, null, null, null, null)
      .then(() => {
      });
  }

  async presentAlert(message, title) {
    const alert = await this.alertCtrl.create({
      message: message,
      subHeader: title,
      buttons: ['OK']
    });
    alert.present();
  }


  back() { alert(this.id_contact);
    this.navCtrl.navigateBack(['/edit-contact', this.id_contact])
    .then(data => alert(JSON.stringify(data)))
    .catch(err => alert(JSON.stringify(err)));
  }

}
