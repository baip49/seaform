import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  title = 'Lista de Alumnos';
  alumnos: any[] = [];
  cargando = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.cargarAlumnos();
  }
  cargarAlumnos() {
    this.cargando = true;
    this.api.getAlumnos().subscribe({
      next: (alumnos) => {
        console.log('Datos recibidos de la API:', alumnos);
        this.alumnos = alumnos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
        this.error = 'Error al cargar la lista de alumnos';
        this.cargando = false;
      },
    });
  }

  editarAlumno(datosAlumno: any) {
    this.router.navigate(['/form'], {
      state: {
        datosAlumno: datosAlumno,
        tipoIngreso: 'edicion',
        esEdicion: true,
      },
    });
  }

  eliminarAlumno(alumno: any) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar al alumno ${alumno.Nombre}?`
      )
    ) {
      this.cargando = true;
      // Aquí se debería implementar la lógica para eliminar el alumno
      // Por ejemplo, llamar a un método en ApiService para eliminar el alumno
      // y luego recargar la lista de alumnos.
      this.api.getAlumnos().subscribe({
        next: () => {
          this.cargarAlumnos();
          alert('Alumno eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar alumno:', error);
          this.error = 'Error al eliminar el alumno';
          this.cargando = false;
        },
      });
    }
  }
}
