import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from 'ionic-cache';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-field-contacts',
  templateUrl: './field-contacts.page.html',
  styleUrls: ['./field-contacts.page.scss'],
})
export class FieldContactsPage implements OnInit {

  town_name: any;
  contacts: any[] = [];
  public searchTerm: string = "";

  constructor(
    private db: DatabaseService,
    public loading: LoadingService,
    public translate: TranslateService,
    public navCtrl: NavController,
    public cache: CacheService,
    private storage: Storage,
    private file: File
  ) {
    this.cache.clearAll();
  }

  ngOnInit() {
    this.storage.get('town_id').then((val) => {

      this.translate.get('LOADING_CONTACT').subscribe(value => {
        this.loading.showLoader(value);
      });

      this.db.lastLogedUser().then(usr => {
        this.db.loadContacts(usr.id_contact, usr.agent_type, val).then(_ => {
          this.db.getContacts().subscribe(data => {

            data.forEach(contact => {

              let nb_plant = 0;
              this.db.checkIfFarmerHasPlantation(contact.id_contact).then(plant => { 
                nb_plant = plant.number_of_plantation;

                let filepath = this.file.externalRootDirectory + 'icollect_bu/avatar/';
                let filename = contact.avatar;

                this.file.checkFile(filepath, filename)
                  .then(() => {
                    this.contacts.push({
                      id_contact: contact.id_contact,
                      name: contact.name,
                      town_name: contact.town_name,
                      status_data: contact.status_data,
                      photo: filepath + filename,
                      number_of_plantation: nb_plant
                    });

                    this.town_name = contact.town_name;
                  })
                  .catch(() => {
                    this.contacts.push({
                      id_contact: contact.id_contact,
                      name: contact.name,
                      town_name: contact.town_name,
                      status_data: contact.status_data,
                      photo: '../../../assets/user.png',
                      number_of_plantation: nb_plant
                    });

                    this.town_name = contact.town_name;
                  });
              });
            });

            this.loading.hideLoader();
          });

        });
      });

    }).catch(() => {
      this.back();
    });
  }

  cPlantationOnMap(id_contact) {
    this.storage.remove('field_contact_id');
    if (id_contact != 'all') {
      this.storage.set('field_contact_id', id_contact).then(() => {
        this.navCtrl.navigateRoot(['/field-tabs/field-tabs/field-map']);
      });
    } else {
      this.navCtrl.navigateRoot(['/field-tabs/field-tabs/field-map']);
    }
  }

  back() {
    this.navCtrl.navigateRoot(['/menu/field-mapping']);
  }
}
