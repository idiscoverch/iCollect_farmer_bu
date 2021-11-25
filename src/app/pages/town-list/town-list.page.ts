import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-town-list',
  templateUrl: './town-list.page.html',
  styleUrls: ['./town-list.page.scss'],
})
export class TownListPage implements OnInit {

  towns: any[] = [];

  coordx: any;
  coordy: any;
  accuracy: any;
  location_type: any;
  town: any;
  area: any;
  description: any;

  public searchTerm: string = "";

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    private db: DatabaseService,
    public loading: LoadingService,
    private router: ActivatedRoute,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.coordx = this.router.snapshot.paramMap.get('coordx');
    this.coordy = this.router.snapshot.paramMap.get('coordy');
    this.accuracy = this.router.snapshot.paramMap.get('accuracy');
    this.location_type = this.router.snapshot.paramMap.get('location_type');
    this.town = this.router.snapshot.paramMap.get('town');
    this.area = this.router.snapshot.paramMap.get('area');
    this.description = this.router.snapshot.paramMap.get('description');

    this.loading.showLoader('Loading Towns...');

    this.towns = [];
    this.db.lastLogedUser().then(usr => { 
      this.db.loadRegionTowns(usr.name_town).then(() => { 
        this.db.getTowns().subscribe(data => { 
          this.towns = data;
          this.loading.hideLoader();
        });
  
      }).catch(err => { 
        console.log(err);
        this.loading.hideLoader();
        this.presentAlert('Please download towns in settings page before.', 'Error');
        this.back();
      });
    });
    
    this.setFilteredItems();
  }

  async presentAlert(message, title) {
    const alert = await this.alertCtrl.create({
      message: message,
      subHeader: title,
      buttons: ['OK']
    });
    alert.present();
  }

  setFilteredItems() {
    this.towns = this.filterItems(this.searchTerm);
  }

  filterItems(searchTerm) {
    return this.towns.filter(item => {
      return item.name_town.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  onCancel(event) {
    console.log(event);
    this.ngOnInit();
  }

  ionRefresh(event) {
    console.log('Pull Event Triggered!');
    setTimeout(() => {
      console.log('Async operation has ended');
      this.ngOnInit();
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

  itemTown(item) {
    let data = {
      coordx: this.coordx,
      coordy: this.coordy,
      accuracy: this.accuracy,
      location_type: this.location_type,
      town: this.town,
      area: this.area,
      description: this.description,
      gid_town: item.gid_town,
      name_town: item.name_town
    }

    this.navCtrl.navigateBack(['/new-location/', data]);
  }

  back() {
    let data = {
      coordx: this.coordx,
      coordy: this.coordy,
      accuracy: this.accuracy,
      location_type: this.location_type,
      town: this.town,
      area: this.area,
      description: this.description
    }

    this.navCtrl.navigateBack(['/new-location/', data]);
  }

}
