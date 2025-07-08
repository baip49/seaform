import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-pantalla-inicial',
  imports: [ReactiveFormsModule],
  templateUrl: './pantalla-inicial.component.html',
  styleUrl: './pantalla-inicial.component.css',
})
export class PantallaInicialComponent {
  title = 'SEA - COBACH';

  pantallaInicial: FormGroup;

  constructor(private fb: FormBuilder) {
    this.pantallaInicial = this.fb.group({
      tieneMatricula: ['', [Validators.required]],
      matricula: '',
      tipo: ['', [Validators.required]],
    });
  }

  tieneMatricula(value: boolean) {
    const matriculaControl = this.pantallaInicial.get('matricula');
    console.log('Valor de primera vez:', value);
    if (value === true) {
      matriculaControl?.enable();
    } else {
      matriculaControl?.disable();
      matriculaControl?.setValue('');
    }
  }

  tipo(value: boolean) {
    console.log(value);
  }

  submit() {
    console.log('Formulario enviado:', this.pantallaInicial.value);
  }
}
