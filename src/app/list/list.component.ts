import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  title = 'Lista de Alumnos';
  alumnos: any[] = [];
  cargando = false;
  error = '';
  terminoBusqueda = '';
  alumnosFiltrados: any[] = [];
  
  // Propiedades para el modal de documentos
  mostrarModalDocumentos = false;
  documentosAlumno: any[] = [];
  alumnoSeleccionado: any = null;
  cargandoDocumentos = false;

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
        this.alumnosFiltrados = alumnos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
        this.error = 'Error al cargar la lista de alumnos';
        this.cargando = false;
      },
    });
  }

  buscarAlumnos() {
    if (!this.terminoBusqueda.trim()) {
      this.alumnosFiltrados = this.alumnos;
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.alumnosFiltrados = this.alumnos.filter((alumno) => {
      return (
        alumno.Nombre?.toLowerCase().includes(termino) ||
        alumno.ApellidoPaterno?.toLowerCase().includes(termino) ||
        alumno.ApellidoMaterno?.toLowerCase().includes(termino) ||
        alumno.Matricula?.toLowerCase().includes(termino) ||
        alumno.CURP?.toLowerCase().includes(termino) ||
        alumno.Correo?.toLowerCase().includes(termino) ||
        alumno.Telefono?.includes(termino) ||
        alumno.Localidad?.toLowerCase().includes(termino) ||
        alumno.Municipio?.toLowerCase().includes(termino) ||
        alumno.Estado?.toLowerCase().includes(termino) ||
        `${alumno.Nombre} ${alumno.ApellidoPaterno} ${alumno.ApellidoMaterno}`
          .toLowerCase()
          .includes(termino)
      );
    });
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.alumnosFiltrados = this.alumnos;
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
        // No está implementada aún
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

  // Método para abrir modal de documentos
  verDocumentos(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.mostrarModalDocumentos = true;
    this.cargarDocumentosAlumno(alumno.Id || alumno.id);
  }

  // Método para cargar documentos del alumno
  cargarDocumentosAlumno(idAlumno: string) {
    this.cargandoDocumentos = true;
    this.documentosAlumno = [];
    
    this.api.obtenerDocumentosAlumno(idAlumno).subscribe({
      next: (response) => {
        console.log('Documentos del alumno:', response);
        this.documentosAlumno = response.documentos || [];
        this.cargandoDocumentos = false;
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
        this.cargandoDocumentos = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los documentos del alumno',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    });
  }

  // Método para cerrar modal
  cerrarModalDocumentos() {
    this.mostrarModalDocumentos = false;
    this.documentosAlumno = [];
    this.alumnoSeleccionado = null;
  }

  // Método para visualizar archivo en nueva pestaña
  visualizarArchivo(documento: any) {
    if (documento.disponible) {
      const url = this.api.obtenerUrlVisualizarArchivo(documento.Id);
      window.open(url, '_blank');
    } else {
      Swal.fire({
        title: 'Archivo no disponible',
        text: 'Este archivo no se encuentra disponible en el servidor',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  // Método para descargar archivo
  descargarArchivo(documento: any) {
    if (documento.disponible) {
      const url = this.api.obtenerUrlDescargarArchivo(documento.Id);
      // Crear un enlace temporal para forzar la descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = this.obtenerNombreReal(documento.NombreArchivo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Swal.fire({
        title: 'Archivo no disponible',
        text: 'Este archivo no se encuentra disponible en el servidor',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  // Método para obtener el tipo de documento del nombre
  obtenerTipoDocumento(nombreArchivo: string): string {
    const separadorIndex = nombreArchivo.indexOf('|');
    if (separadorIndex > -1) {
      return nombreArchivo.substring(0, separadorIndex);
    }
    return nombreArchivo;
  }

  // Método para obtener el nombre real del archivo
  obtenerNombreReal(nombreArchivo: string): string {
    const separadorIndex = nombreArchivo.indexOf('|');
    if (separadorIndex > -1) {
      return nombreArchivo.substring(separadorIndex + 1);
    }
    return nombreArchivo;
  }

  // Método para formatear el tamaño del archivo
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
