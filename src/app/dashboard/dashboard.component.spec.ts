import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { StudentSearchComponent } from '../student-search/student-search.component';
import { StudentService } from '../student.service';
import { STUDENTS } from '../mock-students';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let studentService;
  let getStudentsSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    studentService = jasmine.createSpyObj('StudentService', ['getStudents']);
    getStudentsSpy = studentService.getStudents.and.returnValue(of(STUDENTS));
    TestBed
        .configureTestingModule({
          declarations: [DashboardComponent, StudentSearchComponent],
          imports: [RouterTestingModule.withRoutes([])],
          providers: [{provide: StudentService, useValue: studentService}]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Top Students" as headline', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toEqual('Top Students');
  });

  it('should call studentService', waitForAsync(() => {
       expect(getStudentsSpy.calls.any()).toBe(true);
     }));

  it('should display 4 links', waitForAsync(() => {
       expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
     }));
});
