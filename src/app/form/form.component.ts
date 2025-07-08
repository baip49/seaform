import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  title = 'SEA - COBACH';

  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      id: [null],
      curp: [''],
      matricula: ['', [Validators.required]],
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      fechaNacimiento: [''],
      sexo: [''],
      telefono: [''],
      correo: [''],
      idSede: ['', [Validators.required, Validators.min(1), Validators.max(4)]],
      estadoCivil: [''],
      idNacionalidad: [''],
      hablalenguaIndigena: [''],
      lengua: [''],
      tieneBeca: [''],
      queBeca: [''],
      hijoDeTrabjador: [''],
      idCapturo: [''],
      fechaTramite: [''],
      fechaCaptura: [''],
      idRol: [''],
      tieneAlergias: [''],
      alergias: [''],
      tipoSangre: [''],
      tieneDiscapacidad: [''],
      discapacidad: [''],
      nombreTutor: [''],
      apellidoMaternoTutor: [''],
      apellidoPaternoTutor: [''],
      telefonoTutor: [''],
      codigoPostal: [''],
      calle: [''],
      entreCalles: [''],
      numeroExterior: [''],
      numeroInterior: [''],
      localidad: [''],
    });
  }

  // Primera vez
  primeraVez(value: string) {
    const matriculaControl = this.formulario.get('matricula');

    if (value === 'si') {
      console.log('Sí, es mi primera vez estudiando un bachillerato');
      matriculaControl?.disable();
      matriculaControl?.setValue('');
    }
    if (value === 'no-cobach') {
      console.log('No, he estudiado antes en COBACH');
      matriculaControl?.enable();
    }
    if (value === 'no-otra') {
      console.log('No, vengo de una escuela diferente a COBACH');
      matriculaControl?.disable();
      matriculaControl?.setValue('');
    }
  }

  // Enviar
  submit() {
    if (this.formulario.valid) {
      console.log('Formulario validado:', this.formulario.value);
    }
  }
}
