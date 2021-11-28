import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Aluno } from './aluno';
import { MessageService } from './message.service';


@Injectable({ providedIn: 'root' })
export class AlunoService {

  private alunoesUrl = 'api/alunos';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET alunos from the server */
  getAlunos(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(this.alunoesUrl)
      .pipe(
        tap(_ => this.log('fetched alunos')),
        catchError(this.handleError<Aluno[]>('getAlunos', []))
      );
  }

  /** GET aluno by id. Return `undefined` when id not found */
  getAlunoNo404<Data>(id: number): Observable<Aluno> {
    const url = `${this.alunoesUrl}/?id=${id}`;
    return this.http.get<Aluno[]>(url)
      .pipe(
        map(alunos => alunos[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} aluno id=${id}`);
        }),
        catchError(this.handleError<Aluno>(`getAluno id=${id}`))
      );
  }

  /** GET aluno by id. Will 404 if id not found */
  getAluno(id: number): Observable<Aluno> {
    const url = `${this.alunoesUrl}/${id}`;
    return this.http.get<Aluno>(url).pipe(
      tap(_ => this.log(`fetched aluno id=${id}`)),
      catchError(this.handleError<Aluno>(`getAluno id=${id}`))
    );
  }

  /* GET alunos whose name contains search term */
  searchAlunos(term: string): Observable<Aluno[]> {
    if (!term.trim()) {
      // if not search term, return empty aluno array.
      return of([]);
    }
    return this.http.get<Aluno[]>(`${this.alunoesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found alunos matching "${term}"`) :
         this.log(`no alunos matching "${term}"`)),
      catchError(this.handleError<Aluno[]>('searchAlunos', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new aluno to the server */
  addAluno(aluno: Aluno): Observable<Aluno> {
    return this.http.post<Aluno>(this.alunoesUrl, aluno, this.httpOptions).pipe(
      tap((newAluno: Aluno) => this.log(`added aluno w/ id=${newAluno.id}`)),
      catchError(this.handleError<Aluno>('addAluno'))
    );
  }

  /** DELETE: delete the aluno from the server */
  deleteAluno(id: number): Observable<Aluno> {
    const url = `${this.alunoesUrl}/${id}`;

    return this.http.delete<Aluno>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted aluno id=${id}`)),
      catchError(this.handleError<Aluno>('deleteAluno'))
    );
  }

  /** PUT: update the aluno on the server */
  updateAluno(aluno: Aluno): Observable<any> {
    return this.http.put(this.alunoesUrl, aluno, this.httpOptions).pipe(
      tap(_ => this.log(`updated aluno id=${aluno.id}`)),
      catchError(this.handleError<any>('updateAluno'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a AlunoService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`AlunoService: ${message}`);
  }
}
