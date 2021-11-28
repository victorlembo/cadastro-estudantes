import { Component, OnInit } from '@angular/core';

import { Aluno } from '../aluno';
import { AlunoService } from '../aluno.service';

@Component({
  selector: 'app-alunos',
  templateUrl: './alunos.component.html',
  styleUrls: ['./alunos.component.css']
})
export class AlunosComponent implements OnInit {
  alunos: Aluno[] = [];

  constructor(private alunoService: AlunoService) { }

  ngOnInit(): void {
    this.getAlunos();
  }

  getAlunos(): void {
    this.alunoService.getAlunos()
    .subscribe(alunos => this.alunos = alunos);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.alunoService.addAluno({ name } as Aluno)
      .subscribe(aluno => {
        this.alunos.push(aluno);
      });
  }

  delete(aluno: Aluno): void {
    this.alunos = this.alunos.filter(h => h !== aluno);
    this.alunoService.deleteAluno(aluno.id).subscribe();
  }

}
