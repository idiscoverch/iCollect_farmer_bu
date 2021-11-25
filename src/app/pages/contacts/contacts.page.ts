import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  contacts: any[] = [];
  contact_data: any;
  selcted_task: any;
  taskList: any;
  user: any;

  new_data = false;
  start: any = 1;
  end: any = 30;

  public searchTerm: string = "";

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    private db: DatabaseService,
    public loading: LoadingService,
    private storage: Storage,
    private webview: WebView,
    private file: File
  ) {
    this.storage.remove('id_project');
    this.db.syncPopUp();
  }
 
  ngOnInit() {
    this.taskList = [];
    this.db.lastLogedUser().then(usr => { 
      this.user = usr;
      this.db.loadCompanyTasks(usr.id_primary_company).then(_ => {
        this.db.getProjectTasks().subscribe(data => {
          this.taskList = data;
        });
      });

      this.translate.get('LOADING_CONTACT').subscribe(value => {
        this.loading.showLoader(value);
      });
      
      this.contacts = [];
      if(usr.agent_type == 3) { 
        this.new_data = false;
        this.db.loadFarmer(usr.id_contact).then(_ => {
          this.db.getContacts().subscribe(data => {
            this.contact_data = data;
            this.loadData();
            this.loading.hideLoader();
          });
        });
  
      } else {
        this.new_data = true;
        this.selcted_task = 0;
        this.db.loadAllContactSteps(0, this.start, this.end).then(_ => {
          this.db.getContacts().subscribe(data => {
            this.contact_data = data;
            this.loadData();
            this.loading.hideLoader();
          });
        });
      }
    });   
  }

  contactsByTask() {
    this.contacts = [];
    this.db.loadAllContact(this.selcted_task).then(_ => {
      this.db.getContacts().subscribe(data => {
        this.contact_data = data;
        this.loadData();
        this.loading.hideLoader();
      });
    });
  }

  loadData() {
    this.contacts = [];

    this.contact_data.forEach(contact => {
      let filepath = this.file.externalRootDirectory + 'icollect_bu/avatar/';
      let filename = contact.avatar;

      this.file.checkFile(filepath, filename)
        .then(() => {
          this.contacts.push({
            id_contact: contact.id_contact,
            contact_code: contact.contact_code,
            name: contact.name,
            town_name: contact.town_name,
            status_data: contact.status_data,
            photo: this.webview.convertFileSrc(filepath + filename)
          });
        })
        .catch(() => {
          if (contact.avatar_path != null) {
            this.contacts.push({
              id_contact: contact.id_contact,
              contact_code: contact.contact_code,
              name: contact.name,
              town_name: contact.town_name,
              status_data: contact.status_data,
              photo: this.webview.convertFileSrc(contact.avatar_path)
            });
          } else {
            this.contacts.push({
              id_contact: contact.id_contact,
              contact_code: contact.contact_code,
              name: contact.name,
              town_name: contact.town_name,
              status_data: contact.status_data,
              photo: '../../../assets/user.png'
            });
          }
        });
    });

    this.contacts = this.contacts.sort((a: any, b: any) => {
      if (a.name < b.name) {
        return -1;
      }

      if (a.name > b.name) {
        return 1;
      }

      return 0;
    });

    this.setFilteredItems();
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

  setFilteredItems() {
    this.contacts = this.filterItems(this.searchTerm);
  }

  filterItems(searchTerm) {
    return this.contacts.filter(item => {
      if(this.user.search_type == 'code') {
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

  /*newContact() {
    this.navCtrl.navigateForward(['/new-contact']);
  }*/

}
