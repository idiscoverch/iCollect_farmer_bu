import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FieldContactsPage } from './field-contacts.page';

describe('FieldContactsPage', () => {
  let component: FieldContactsPage;
  let fixture: ComponentFixture<FieldContactsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldContactsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldContactsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
