import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-pantalla-inicial',
  imports: [ReactiveFormsModule],
  templateUrl: './pantalla-inicial.component.html',
  styleUrl: './pantalla-inicial.component.css',
})
export class PantallaInicialComponent {
  title = 'SEA - COBACH';
  pantallaInicial: FormGroup;
  cargando = false;
  error = '';

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
  }

  toggleEnabled(name: string, value: boolean) {
    const control = this.pantallaInicial.get(name);
    if (control) {
      if (value) {
        control.enable();
      } else {
        control.disable();
        control.setValue('');
      }
    }
  }

  clearField(name: string) {
    const control = this.pantallaInicial.get(name);
    if (control) {
      control.setValue('');
    }
  }

  tipo(value: boolean) {
    console.log(value);
  }

  async submit() {
    if (this.pantallaInicial.valid) {
      const formData = this.pantallaInicial.value;

      try {
        this.cargando = true;
        this.error = '';

        if (formData.tieneMatricula === 'true' && formData.matricula) {
          // Obtener datos del alumno por matrícula
          const datosAlumno = await this.api
            .porMatricula(formData.matricula)
            .toPromise();

          // Navegar al formulario con los datos del alumno
          this.router.navigate(['/form'], {
            state: {
              datosAlumno: datosAlumno,
              tipoIngreso: 'matricula',
            },
          });
        } else {
          // Navegar al formulario sin datos previos
          this.router.navigate(['/form'], {
            state: {
              datosAlumno: null,
              tipoIngreso:
                formData.tipo === 'true' ? 'primera-vez' : 'otra-institucion',
            },
          });
        }
      } catch (error) {
        console.error('Error al obtener datos del alumno:', error);
        this.error =
          'No se pudo obtener la información del alumno. Verifica la matrícula.';
      } finally {
        this.cargando = false;
      }
    }
  }
}
