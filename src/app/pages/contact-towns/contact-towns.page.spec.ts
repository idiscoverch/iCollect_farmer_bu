import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContactTownsPage } from './contact-towns.page';

describe('ContactTownsPage', () => {
  let component: ContactTownsPage;
  let fixture: ComponentFixture<ContactTownsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTownsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactTownsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
