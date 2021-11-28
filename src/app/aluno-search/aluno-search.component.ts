import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Aluno } from '../aluno';
import { AlunoService } from '../aluno.service';

@Component({
  selector: 'app-aluno-search',
  templateUrl: './aluno-search.component.html',
  styleUrls: [ './aluno-search.component.css' ]
})
export class AlunoSearchComponent implements OnInit {
  alunos$!: Observable<Aluno[]>;
  private searchTerms = new Subject<string>();

  constructor(private alunoService: AlunoService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.alunos$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.alunoService.searchAlunos(term)),
    );
  }
}
