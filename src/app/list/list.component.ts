import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  imports: [CommonModule, HeaderComponent],
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
    Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Deseas eliminar al alumno <strong>${alumno.Nombre}</strong>?
      <br>¡No podrás revertir esta acción!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        // Aquí debe ir la lógica para eliminar el alumno
        this.api.getAlumnos().subscribe({
          next: () => {
            this.cargarAlumnos();
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El alumno ha sido eliminado correctamente.',
              icon: 'success',
            });
          },
          error: (error) => {
            console.error('Error al eliminar alumno:', error);
            this.error = 'Error al eliminar el alumno';
            this.cargando = false;
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al eliminar el alumno.',
              icon: 'error',
            });
          },
        });
      }
    });
  }
}
