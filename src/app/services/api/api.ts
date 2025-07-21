import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Sangre {
  Id: number;
  Descripcion: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  // Obtener la lengua que se ingrese en el input
  searchLenguas(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lenguas/${term}`);
  }

  // Obtener lengua por id
  getLengua(id_lengua: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lenguas/id/${id_lengua}`);
  }

  // Obtener la localidad que se ingrese en el input
  searchLocalidades(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/localidades/${term}`);
  }

  // Obtener tipos de sangre
  getSangre(): Observable<Sangre[]> {
    return this.http.get<Sangre[]>(`${this.baseUrl}/sangre`);
  }

  // Obtener alumnos
  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/alumnos`);
  }

  // Obtener alumno
  getAlumno(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/alumnos/${matricula}`);
  }

  // Actualizar alumno
  actualizarAlumno(alumno: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/alumnos/actualizar`,
      alumno
    );
  }

  // SEA
  porMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/alumnos/matricula/${matricula}`);
  }
  porCurp(curp: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/alumnos/curp/${curp}`);
  }
}
