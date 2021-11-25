import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TownListPage } from './town-list.page';

describe('TownListPage', () => {
  let component: TownListPage;
  let fixture: ComponentFixture<TownListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TownListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TownListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
