import { Component, OnInit } from '@angular/core';
import { Aluno } from '../aluno';
import { AlunoService } from '../aluno.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  alunos: Aluno[] = [];

  constructor(private alunoService: AlunoService) { }

  ngOnInit(): void {
    this.getAlunos();
  }

  getAlunos(): void {
    this.alunoService.getAlunos()
      .subscribe(alunos => this.alunos = alunos.slice(1, 5));
  }
}
