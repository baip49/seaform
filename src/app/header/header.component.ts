import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  title = 'Sistema de Enseñanza Abierta (SEA)';

  @Input() esEdicion: boolean = false;
  // @Input() tipoIngreso: string = '';
  @Input() subtitulo: string = '';

  // Obtener el subtítulo
  getSubtitle(): string {
    if (this.subtitulo) {
      return this.subtitulo;
    }

    if (this.esEdicion) {
      return 'Editando información del alumno';
    }

    // if (this.tipoIngreso === 'matricula') {
    //   return 'Actualizando información del alumno con matrícula existente';
    // }

    // if (this.tipoIngreso === 'otra-institucion') {
    //   return 'Registro de alumno proveniente de otra institución educativa';
    // }

    // if (this.tipoIngreso === 'primera-vez') {
    //   return 'Registro de nuevo alumno - primera vez en bachillerato';
    // }

    // Subtítulo por defecto
    return 'El presente formulario tiene la finalidad de codificar tus datos, los cuales están resguardados y nos permite iniciar tu expediente para los procesos administrativos de tu ingreso al Sistema de Educación Abierta';
  }
}
