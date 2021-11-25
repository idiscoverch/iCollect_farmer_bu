import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.page.html',
  styleUrls: ['./contact-list.page.scss'],
})
export class ContactListPage implements OnInit {

  contacts: any[] = [];
  //contact_data: any;
  new_contact: any = false;
  user: any;

  start: any = 0;
  end: any = 50;
  town_id: any;

  public searchTerm: string = "";

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    private db: DatabaseService,
    public loading: LoadingService,
    private storage: Storage,
    private webview: WebView,
    private file: File
  ) { }

  ngOnInit() {
    this.storage.remove('id_contact');
    this.loadData();
  }

  loadData() {
    this.contacts = [];
    this.translate.get('LOADING_CONTACT').subscribe(value => {
      this.loading.showLoader(value);
    });

    this.storage.get('town_id').then((val) => {
      this.db.lastLogedUser().then(usr => {
        this.user = usr;
        this.town_id = val;

        if (usr.agent_type != 3) {
          this.new_contact = true;
        }

        this.db.loadContacts(usr.id_contact, usr.agent_type, val).then(_ => {
          this.db.getContacts().subscribe(data => { 
            this.contacts = data.sort((a: any, b: any) => {
              if (a.name < b.name) {
                return -1;
              }
        
              if (a.name > b.name) {
                return 1;
              }
        
              return 0;
            }); 
          });
        });
      });
    });

    this.setFilteredItems();
    this.loading.hideLoader();

    /*if(event) {
      event.atrget.complete();
    }*/

  }

  separateLetter(record, recordIndex, records) {
    if (recordIndex == 0) {
      return record.name[0].toUpperCase();
    }

    let first_prev = records[recordIndex - 1].name[0];
    let first_current = record.name[0];

    if (first_prev != first_current) {
      return first_current.toUpperCase();
    }

    return null;
  }

  /*loadMore(event) {
    this.start = this.end;
    this.end = this.end + 50;

    this.loadData(event);

    if(this.contact_data.length < 50) {
      event.target.disabled = true;
    } 
  }*/

  setFilteredItems() {
    this.contacts = this.filterItems(this.searchTerm);
  }

  filterItems(searchTerm) {
    return this.contacts.filter(item => {
      if (this.user.search_type == 'code') {
        return item.contact_code.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      } else {
        return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      }
    });
  }

  onCancel(event) {
    console.log(event);
    this.loadData();
  }

  ionRefresh(event) {
    console.log('Pull Event Triggered!');
    setTimeout(() => {
      console.log('Async operation has ended');
      this.loadData();
      //complete()  signify that the refreshing has completed and to close the refresher
      event.target.complete();
    }, 2000);
  }

  ionPull(event) {
    //Emitted while the user is pulling down the content and exposing the refresher.
    console.log('ionPull Event Triggered!' + event);
  }

  ionStart(event) {
    //Emitted when the user begins to start pulling down.
    console.log('ionStart Event Triggered!' + event);
  }

  itemContact(item) {
    this.storage.remove('id_contact');
    this.storage.set('id_contact', item.id_contact);
    this.navCtrl.navigateForward(['/tabs/tabs/contact-details/' + item.id_contact]);
  }

  newContact() {
    this.navCtrl.navigateForward(['/new-contact']);
  }

}
