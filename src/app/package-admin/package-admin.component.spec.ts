import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageAdminComponent } from './package-admin.component';

describe('PackageAdminComponent', () => {
  let component: PackageAdminComponent;
  let fixture: ComponentFixture<PackageAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
