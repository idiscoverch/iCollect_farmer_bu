import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { NetworkService, ConnectionStatus } from '../../services/network.service';
import mapboxgl from "../../../assets/mapbox-gl-cordova-offline.js";
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingService } from 'src/app/services/loading.service';
//import { File } from '@ionic-native/file/ngx';
import { CacheService } from "ionic-cache";
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import turf from '../../../assets/turf.min.js';

@Component({
  selector: 'app-field-map',
  templateUrl: './field-map.page.html',
  styleUrls: ['./field-map.page.scss'],
})
export class FieldMapPage implements OnInit {

  map: any;
  contacts: any[] = [];
  x: number = 0;

  id_project: any;
  public searchTerm: string = "";

  plantations: any[] = [];
  id_contact: any = null;


  id_town: any = null;

  map_online_btn = false;
  map_online_btn_color: any;
  map_offline_btn = false;
  map_offline_btn_color: any;
  map_online_sat_btn = false;
  map_online_sat_btn_color: any;

  mapType = 'mapbox://styles/mapbox/streets-v11';
  timeout = 5000;

  constructor(
    private platform: Platform,
    private db: DatabaseService,
    public loading: LoadingService,
    private networkService: NetworkService,
    public translate: TranslateService,
    public navCtrl: NavController,
    public cache: CacheService,
    private storage: Storage,
    //private file: File
  ) {
    this.cache.clearAll();
    this.platform.ready().then(() => {
      mapboxgl.accessToken = 'pk.eyJ1IjoiY3JvdGg1MyIsImEiOiJjajRsazkxenowdnZuMnducjRiam90djlnIn0.XMeuMgUwPncR3fMwSgS7WA';
    });
  }

  ngOnInit() {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status == ConnectionStatus.Online) {
        this.map_online_btn = true;
        this.map_offline_btn = true;
        this.map_online_sat_btn = true;
      }

      if (status == ConnectionStatus.Offline) {
        this.map_offline_btn = false;
        this.map_online_btn = false;
        this.map_online_sat_btn = false;
      }
    });

  }

  ionViewWillEnter() {
    this.selectMap('offline');
  }


  selectMap(conf) {
    if (conf == 'online') {
      this.map_online_btn_color = 'success';
      this.map_offline_btn_color = 'danger';
      this.map_online_sat_btn_color = 'danger';
      this.mapType = 'mapbox://styles/mapbox/streets-v11';
      setTimeout(() => {
        this.storage.get('field_contact_id').then(id => {
          this.id_contact = id;
          if (this.id_contact != null) {
            this.map_Online();
          }
        });

        this.storage.get('town_id').then((val) => {
          this.id_town = val;
          if (this.id_contact == null) {
            this.map_Online();
          }
        });
      }, 600);

    } else
      if (conf == 'online_sat') {
        this.map_online_sat_btn_color = 'success';
        this.map_offline_btn_color = 'danger';
        this.map_online_btn_color = 'danger';
        this.mapType = 'mapbox://styles/mapbox/satellite-streets-v11';
        setTimeout(() => {
          this.storage.get('field_contact_id').then(id => {
            this.id_contact = id;
            if (this.id_contact != null) {
              this.map_Online();
            }
          });

          this.storage.get('town_id').then((val) => {
            this.id_town = val;
            if (this.id_contact == null) {
              this.map_Online();
            }
          });
        }, 600);

      } else {
        this.map_offline_btn_color = 'success';
        this.map_online_btn_color = 'danger';
        this.map_online_sat_btn_color = 'danger';
        setTimeout(() => {
          this.storage.get('field_contact_id').then(id => {
            this.id_contact = id;
            if (this.id_contact != null) {
              this.map_Offline();
            }
          });

          this.storage.get('town_id').then((val) => {
            this.id_town = val;
            if (this.id_contact == null) {
              this.map_Offline();
            }
          });
        }, 600);
      }
  }

  map_Offline() {
    new mapboxgl.OfflineMap({
      container: 'field-map',
      style: 'assets/styles/osm-bright/style-offline.json',
      //center: [coordy, coordx],
      //zoom: 10,
      bearing: -45,
      hash: true
    }).then((map) => {
      map.addControl(new mapboxgl.NavigationControl());

      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }));

      map.fitBounds([[-8.665129, 4.141916], [-2.476215, 10.74769]]);

      this.db.loadFieldMapPlantations(this.id_town).then(() => {
        this.db.getFieldMapPlantations().subscribe(data => {
          data.forEach(plantation => {

            let popup = '<p><strong>Farmer :</strong> ' + plantation.name + '<br/>'
              + '<strong>Culture :</strong> ' + plantation.culture + '<br/>'
              + '<strong>Area :</strong> ' + plantation.area_round + ' m2<br/>'
              + '<strong>Area Acres :</strong> ' + plantation.area_acres_round + ' Acres<br/>'
              + '<strong>Surface :</strong> ' + plantation.surface_ha_round + ' Ha</p>';

            if (this.id_contact == null) {

              if ((plantation.coordx != null) && (plantation.coordx != "")) {
                new mapboxgl.Marker({ color: 'red' })
                  .setLngLat([plantation.coordy, plantation.coordx])
                  .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup))
                  .addTo(map);
              }

              if ((plantation.geom_json != null) && (plantation.geom_json != "")) {
                let polygon: any;
                if (plantation.mobile_data == 0) {

                  let json = plantation.geom_json;
                  json = json.replace(/\\/g, '"');

                  let geoJson = JSON.parse(json);
                  geoJson = geoJson.coordinates[0];

                  polygon = {
                    "type": "Feature",
                    "geometry": {
                      "type": "Polygon",
                      "coordinates": geoJson
                    }
                  }

                } else {
                  polygon = JSON.parse(plantation.geom_json);
                }

                map.addLayer({
                  'id': 'plantation_polygon-' + plantation.id_plantation,
                  'type': 'fill',
                  'source': {
                    'type': 'geojson',
                    'data': polygon
                  },
                  'layout': {},
                  'paint': {
                    'fill-color': '#088',
                    'fill-opacity': 0.8
                  }
                });


                map.fitBounds(turf.bbox(polygon), { padding: 20 });

                map.on('click', 'plantation_polygon-' + plantation.id_plantation, (e) => {
                  new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup)
                    .addTo(map);
                });
              }

              this.db.loadPlantationPaths(plantation.id_plantation).then(path => {
                if (path != null) {
                  map.addLayer({
                    "id": "path_line-" + plantation.id_plantation,
                    "type": "line",
                    "source": {
                      "type": "geojson",
                      "data": JSON.parse(path.path_json)
                    },
                    "layout": {
                      "line-join": "round",
                      "line-cap": "round"
                    },
                    "paint": {
                      "line-color": "#8A2BE2",
                      "line-width": 4
                    }
                  });
                }
              });

            } else {
              if (plantation.id_contact == this.id_contact) {

                if ((plantation.coordx != null) && (plantation.coordx != "")) {
                  new mapboxgl.Marker({ color: 'red' })
                    .setLngLat([plantation.coordy, plantation.coordx])
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                      .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup))
                    .addTo(map);
                }

                if ((plantation.geom_json != null) && (plantation.geom_json != "")) {
                  let polygon: any;
                  if (plantation.mobile_data == 0) {

                    let json = plantation.geom_json;
                    json = json.replace(/\\/g, '"');

                    let geoJson = JSON.parse(json);
                    geoJson = geoJson.coordinates[0];

                    polygon = {
                      "type": "Feature",
                      "geometry": {
                        "type": "Polygon",
                        "coordinates": geoJson
                      }
                    }

                  } else {
                    polygon = JSON.parse(plantation.geom_json);
                  }

                  map.addLayer({
                    'id': 'plantation_polygon-' + plantation.id_plantation,
                    'type': 'fill',
                    'source': {
                      'type': 'geojson',
                      'data': polygon
                    },
                    'layout': {},
                    'paint': {
                      'fill-color': '#088',
                      'fill-opacity': 0.8
                    }
                  });

                  map.fitBounds(turf.bbox(polygon), { padding: 20 });

                  map.on('click', 'plantation_polygon-' + plantation.id_plantation, (e) => {
                    new mapboxgl.Popup()
                      .setLngLat(e.lngLat)
                      .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup)
                      .addTo(map);
                  });
                }

                this.db.loadPlantationPaths(plantation.id_plantation).then(path => {
                  if (path != null) {
                    map.addLayer({
                      "id": "path_line-" + plantation.id_plantation,
                      "type": "line",
                      "source": {
                        "type": "geojson",
                        "data": JSON.parse(path.path_json)
                      },
                      "layout": {
                        "line-join": "round",
                        "line-cap": "round"
                      },
                      "paint": {
                        "line-color": "#8A2BE2",
                        "line-width": 4
                      }
                    });
                  }
                });

              }
            }

          });
        });
      });

    });
  }

  map_Online() {
    this.map = new mapboxgl.Map({
      container: 'field-map',
      style: this.mapType,
      //center: [coordy, coordx],
      //zoom: 10
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));

    this.map.fitBounds([[-8.665129, 4.141916], [-2.476215, 10.74769]]);

    this.db.loadFieldMapPlantations(this.id_town).then(() => {
      this.db.getFieldMapPlantations().subscribe(data => {
        data.forEach(plantation => {

          let popup = '<p><strong>Farmer :</strong> ' + plantation.name + '<br/>'
            + '<strong>Culture :</strong> ' + plantation.culture + '<br/>'
            + '<strong>Area :</strong> ' + plantation.area_round + ' m2<br/>'
            + '<strong>Area Acres :</strong> ' + plantation.area_acres_round + ' Acres<br/>'
            + '<strong>Surface :</strong> ' + plantation.surface_ha_round + ' Ha</p>';

          if (this.id_contact == null) {
            if ((plantation.coordx != null) && (plantation.coordx != "")) {
              new mapboxgl.Marker({ color: 'red' })
                .setLngLat([plantation.coordy, plantation.coordx])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                  .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup))
                .addTo(this.map);
            }

            if ((plantation.geom_json != null) && (plantation.geom_json != "")) {
              let polygon: any;
              if (plantation.mobile_data == 0) {

                let json = plantation.geom_json;
                json = json.replace(/\\/g, '"');

                let geoJson = JSON.parse(json);
                geoJson = geoJson.coordinates[0];

                polygon = {
                  "type": "Feature",
                  "geometry": {
                    "type": "Polygon",
                    "coordinates": geoJson
                  }
                }

              } else {
                polygon = JSON.parse(plantation.geom_json);
              }

              this.map.addLayer({
                'id': 'plantation_polygon-' + plantation.id_plantation,
                'type': 'fill',
                'source': {
                  'type': 'geojson',
                  'data': polygon
                },
                'layout': {},
                'paint': {
                  'fill-color': '#088',
                  'fill-opacity': 0.8
                }
              });

              this.map.fitBounds(turf.bbox(polygon), { padding: 20 });

              this.map.on('click', 'plantation_polygon-' + plantation.id_plantation, (e) => {
                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup)
                  .addTo(this.map);
              });

              this.db.loadPlantationPaths(plantation.id_plantation).then(path => {
                if (path != null) {
                  this.map.addLayer({
                    "id": "path_line-" + plantation.id_plantation,
                    "type": "line",
                    "source": {
                      "type": "geojson",
                      "data": JSON.parse(path.path_json)
                    },
                    "layout": {
                      "line-join": "round",
                      "line-cap": "round"
                    },
                    "paint": {
                      "line-color": "#8A2BE2",
                      "line-width": 4
                    }
                  });
                }
              });
            }

          } else {
            if (plantation.id_contact == this.id_contact) {

              if ((plantation.coordx != null) && (plantation.coordx != "")) {
                new mapboxgl.Marker({ color: 'red' })
                  .setLngLat([plantation.coordy, plantation.coordx])
                  .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup))
                  .addTo(this.map);
              }

              if ((plantation.geom_json != null) && (plantation.geom_json != "")) {
                let polygon: any;
                if (plantation.mobile_data == 0) {

                  let json = plantation.geom_json;
                  json = json.replace(/\\/g, '"');

                  let geoJson = JSON.parse(json);
                  geoJson = geoJson.coordinates[0];

                  polygon = {
                    "type": "Feature",
                    "geometry": {
                      "type": "Polygon",
                      "coordinates": geoJson
                    }
                  }

                } else {
                  polygon = JSON.parse(plantation.geom_json);
                }

                this.map.addLayer({
                  'id': 'plantation_polygon-' + plantation.id_plantation,
                  'type': 'fill',
                  'source': {
                    'type': 'geojson',
                    'data': polygon
                  },
                  'layout': {},
                  'paint': {
                    'fill-color': '#088',
                    'fill-opacity': 0.8
                  }
                });

                this.map.fitBounds(turf.bbox(polygon), { padding: 20 });

                this.map.on('click', 'plantation_polygon-' + plantation.id_plantation, (e) => {
                  new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<strong>' + plantation.code_plantation + '</srong>' + popup)
                    .addTo(this.map);
                });

                this.db.loadPlantationPaths(plantation.id_plantation).then(path => {
                  if (path != null) {
                    this.map.addLayer({
                      "id": "path_line-" + plantation.id_plantation,
                      "type": "line",
                      "source": {
                        "type": "geojson",
                        "data": JSON.parse(path.path_json)
                      },
                      "layout": {
                        "line-join": "round",
                        "line-cap": "round"
                      },
                      "paint": {
                        "line-color": "#8A2BE2",
                        "line-width": 4
                      }
                    });
                  }
                });
              }
            }
          }

        });
      });
    });

  }

  back() {
    this.storage.remove('field_contact_id');
    this.navCtrl.navigateRoot(['/menu/field-mapping']);
  }
}
