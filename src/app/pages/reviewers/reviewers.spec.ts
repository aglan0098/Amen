import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reviewers } from './reviewers';

describe('Reviewers', () => {
  let component: Reviewers;
  let fixture: ComponentFixture<Reviewers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reviewers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reviewers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
