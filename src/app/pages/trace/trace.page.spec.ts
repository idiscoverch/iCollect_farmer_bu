import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TracePage } from './trace.page';

describe('TracePage', () => {
  let component: TracePage;
  let fixture: ComponentFixture<TracePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TracePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TracePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
