import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api/api';
import { HeaderComponent } from '../header/header.component';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pantalla-inicial',
  imports: [ReactiveFormsModule, HeaderComponent, CommonModule],
  templateUrl: './pantalla-inicial.component.html',
  styleUrl: './pantalla-inicial.component.css',
})
export class PantallaInicialComponent {
  title = 'SEA - COBACH';
  pantallaInicial: FormGroup;
  cargando = false;
  error = '';
  validandoMatricula = false;
  matriculaValida = false;
  datosAlumnoEncontrado: any = null;
  
  // Subject para validación de matrícula con debounce
  private validarMatricula = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.pantallaInicial = this.fb.group({
      tieneMatricula: ['', [Validators.required]],
      matricula: [''],
      tipo: ['', [Validators.required]],
    });

    // Validación de matrícula con debounce
    this.validarMatricula
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((matricula) => {
          if (matricula && matricula.length >= 3) {
            this.validandoMatricula = true;
            this.error = '';
            return this.api.porMatricula(matricula).pipe(
              catchError((error) => {
                console.log('Error al validar matrícula:', error);
                return of(null);
              })
            );
          } else {
            this.matriculaValida = false;
            this.datosAlumnoEncontrado = null;
            return of(null);
          }
        })
      )
      .subscribe((datos) => {
        this.validandoMatricula = false;
        if (datos && datos.CURP) {
          this.matriculaValida = true;
          this.datosAlumnoEncontrado = datos;
          this.error = '';
        } else {
          this.matriculaValida = false;
          this.datosAlumnoEncontrado = null;
          if (this.pantallaInicial.get('matricula')?.value?.length >= 3) {
            this.error = 'La matrícula ingresada no existe en el sistema COBACH';
          }
        }
      });
  }

  toggleEnabled(field: string, enabled: boolean) {
    const control = this.pantallaInicial.get(field);
    if (enabled) {
      control?.enable();
      if (field === 'matricula') {
        control?.setValidators([Validators.required]);
      }
    } else {
      control?.disable();
      control?.clearValidators();
      control?.setValue('');
      // Limpiar validación de matrícula
      if (field === 'matricula') {
        this.matriculaValida = false;
        this.datosAlumnoEncontrado = null;
        this.error = '';
      }
    }
    control?.updateValueAndValidity();
  }

  tipo(primeraVez: boolean) {
    // Solo almacenar el valor, no necesitamos hacer nada más aquí
  }

  // Método para validar matrícula cuando el usuario escriba
  onMatriculaInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const matricula = target.value.trim();
    
    if (matricula.length >= 3) {
      this.validarMatricula.next(matricula);
    } else {
      this.matriculaValida = false;
      this.datosAlumnoEncontrado = null;
      this.error = '';
    }
  }

  async submit() {
    if (this.pantallaInicial.valid) {
      const formData = this.pantallaInicial.value;

      // Validación adicional para matrícula
      if (formData.tieneMatricula === 'true') {
        if (!formData.matricula) {
          this.error = 'Por favor ingresa tu matrícula';
          return;
        }
        
        if (this.validandoMatricula) {
          this.error = 'Esperando validación de matrícula...';
          return;
        }
        
        if (!this.matriculaValida || !this.datosAlumnoEncontrado) {
          this.error = 'La matrícula ingresada no es válida o no existe en el sistema';
          return;
        }
      }

      try {
        this.cargando = true;
        this.error = '';

        if (formData.tieneMatricula === 'true' && this.datosAlumnoEncontrado) {
          // Navegar al formulario con los datos del alumno para COMPLETAR registro
          this.router.navigate(['/form'], {
            state: {
              datosAlumno: this.datosAlumnoEncontrado,
              tipoIngreso: 'matricula',
              esEdicion: false, // CAMBIO: No es edición, es completar registro
            },
          });
        } else {
          // Determinar el tipoIngreso basado en la selección
          const tipoIngreso =
            formData.tipo === 'true' ? 'primera-vez' : 'otra-institucion';

          // Navegar al formulario sin datos previos
          this.router.navigate(['/form'], {
            state: {
              datosAlumno: null,
              tipoIngreso: tipoIngreso,
              esEdicion: false,
            },
          });
        }
      } catch (error) {
        console.error('Error:', error);
        this.error = 'Ocurrió un error inesperado. Intenta nuevamente.';
      } finally {
        this.cargando = false;
      }
    } else {
      this.error = 'Por favor completa todos los campos requeridos';
    }
  }
}
