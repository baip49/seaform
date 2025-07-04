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
      primeraVez: [''],
      matricula: ['', [Validators.minLength(15)]],
      sede: [''],
      correo: [''],
      telefono: [''],
      nacionalidad: [''],
    });
  }

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
    }
  }

  submit() {
    if (this.formulario.valid) {
      console.log('Datos del formulario', this.formulario.value);
    }
  }
}
