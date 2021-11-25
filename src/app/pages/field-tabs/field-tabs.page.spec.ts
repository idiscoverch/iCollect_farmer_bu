import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FieldTabsPage } from './field-tabs.page';

describe('FieldTabsPage', () => {
  let component: FieldTabsPage;
  let fixture: ComponentFixture<FieldTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldTabsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
