import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AlunoSearchComponent } from '../aluno-search/aluno-search.component';
import { AlunoService } from '../aluno.service';
import { HEROES } from '../mock-alunos';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let alunoService;
  let getAlunosSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    alunoService = jasmine.createSpyObj('AlunoService', ['getAlunos']);
    getAlunosSpy = alunoService.getAlunos.and.returnValue(of(HEROES));
    TestBed
        .configureTestingModule({
          declarations: [DashboardComponent, AlunoSearchComponent],
          imports: [RouterTestingModule.withRoutes([])],
          providers: [{provide: AlunoService, useValue: alunoService}]
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

  it('should display "Top Alunos" as headline', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toEqual('Top Alunos');
  });

  it('should call alunoService', waitForAsync(() => {
       expect(getAlunosSpy.calls.any()).toBe(true);
     }));

  it('should display 4 links', waitForAsync(() => {
       expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
     }));
});
