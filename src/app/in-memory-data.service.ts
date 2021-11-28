import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Student } from './student';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const students = [
      { id: 11, name: 'Abel Ferreira', sex: 'male', city: 'Penafiel', email: 'abel.ferreira@gmail.com', course: 'Educacao Fisica' },
      { id: 12, name: 'Eduardo Pereira', sex: 'male', city: 'Goiania', email: 'dudu.palmeiras@gmail.com', course: 'Eventos' },
      { id: 13, name: 'Breno Lopes', sex: 'male', city: 'Belo Horizonte', email: 'breno.lopes@gmail.com', course: 'DJ' },
      { id: 14, name: 'Raphael Veiga', sex: 'male', city: 'Sao Paulo', email: 'raphael.veiga@gmail.com', course: 'Engenharia' },
      { id: 15, name: 'Abel Ferreira', sex: 'male', city: 'Penafiel', email: 'abel.ferreira@gmail.com', course: 'Educacao Fisica' }
    ];
    return {students};
  }

  // Overrides the genId method to ensure that a student always has an id.
  // If the students array is empty,
  // the method below returns the initial number (11).
  // if the students array is not empty, the method below returns the highest
  // student id + 1.
  genId(students: Student[]): number {
    return students.length > 0 ? Math.max(...students.map(student => student.id)) + 1 : 11;
  }
}