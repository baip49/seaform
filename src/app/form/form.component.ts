import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  title = 'SEA - COBACH';

  data = {
    primeraVez: '',
    matricula: '',
    sede: '',
    correo: '',
    telefono: '',
    nacionalidad: '',
  }

  submit() {
    console.log('Datos del formulario', this.data);
  }
}
