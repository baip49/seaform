import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { ApiService } from '../services/api/api';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit, AfterViewInit {
  title = 'SEA - COBACH';
  formulario: FormGroup;

  // Lenguas
  lenguas: any[] = [];
  lenguasFiltradas: any[] = [];
  terminoLengua = new Subject<string>();
  buscandoLengua = false;
  lenguaSeleccionada: any = null;

  // Localidades
  localidades: any[] = [];
  localidadesFiltradas: any[] = [];
  terminoLocalidad = new Subject<string>();
  buscandoLocalidad = false;
  localidadSeleccionada: any = null;

  sangre: any[] = [];
  esEdicion = false;
  idAlumnoEditar: number | null = null;

  // Datos recibidos del componente anterior
  datosAlumno: any = null;
  tipoIngreso: string = '';

  cargando = false; // Agregar esta propiedad

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private titleService: Title
  ) {
    this.formulario = this.fb.group({
      id: [null],
      curp: [''],
      matricula: [{ value: '' }],
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      fechaNacimiento: [''],
      sexo: [''],
      telefono: [''],
      correo: [''],
      idSede: ['', [Validators.min(1), Validators.max(4)]],
      estadoCivil: [''],
      idNacionalidad: [''],
      hablaLengua: [''],
      idLengua: [''],
      lenguaSearch: [''],
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
      idLocalidad: [''],
      localidadSearch: [''],
    });

    // Obtener datos del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.datosAlumno = navigation.extras.state['datosAlumno'];
      this.tipoIngreso = navigation.extras.state['tipoIngreso']; // Cambiar de 'tipo' a 'tipoIngreso'
      this.esEdicion = navigation.extras.state['esEdicion'] || false;

      console.log('Datos recibidos en FormComponent:', {
        datosAlumno: this.datosAlumno,
        tipoIngreso: this.tipoIngreso,
        esEdicion: this.esEdicion,
      });

      if (this.esEdicion && this.datosAlumno) {
        this.idAlumnoEditar = this.datosAlumno.Id || this.datosAlumno.id;
      }
    }
  }

  ngOnInit() {
    // Llenar el formulario con los datos del alumno si existen
    if (this.datosAlumno) {
      this.llenarFormulario(this.datosAlumno);
    }

    this.terminoLengua
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 2) {
            this.buscandoLengua = true;
            return this.api.searchLenguas(term).pipe(catchError(() => of([])));
          } else {
            return of([]);
          }
        })
      )
      .subscribe((lenguas) => {
        this.lenguasFiltradas = lenguas;
        this.buscandoLengua = false;
      });

    this.formulario.get('hablaLengua')?.valueChanges.subscribe((value) => {
      if (value === '0') {
        this.clearLenguaSelection();
      }
    });

    this.terminoLocalidad
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length >= 2) {
            this.buscandoLocalidad = true;
            return this.api
              .searchLocalidades(term)
              .pipe(catchError(() => of([])));
          } else {
            return of([]);
          }
        })
      )
      .subscribe((localidades) => {
        this.localidadesFiltradas = localidades;
        this.buscandoLocalidad = false;
      });

    this.api.getSangre().subscribe({
      next: (sangre) => {
        this.sangre = sangre;
      },
      error: (error) => {
        console.error('Error al obtener tipos de sangre:', error);
        this.sangre = [];
      },
    });
  }

  ngAfterViewInit() {
    // Configurar controles condicionales después de que la vista se haya inicializado
    if (this.datosAlumno) {
      setTimeout(() => {
        this.configurarControlesCondicionales();
      }, 0);
    }
  }

  private llenarFormulario(datos: any) {
    // Agregar este console.log para depurar
    console.log('Datos recibidos:', datos);
    const mapearEstadoCivil = (estado: string) => {
      switch (estado.toLowerCase()) {
        case 'soltero':
          return 'S';
        case 'casado':
          return 'C';
        case 'divorciado':
          return 'D';
        default:
          return estado || 'S';
      }
    };

    const mapearNacionalidad = (nacionalidad: string) => {
      switch (nacionalidad.toLowerCase()) {
        case 'mexicana':
          return '1';
        case 'extranjera':
          return '2';
        default:
          return nacionalidad || '1';
      }
    };

    const mapearBooleano = (valor: any): number => {
      if (valor === true || valor === 1 || valor === '1') {
        return 1;
      } else if (valor === false || valor === 0 || valor === '0') {
        return 0;
      }
      return 0;
    };

    const camposAMapear = {
      id: datos.Id,
      curp: datos.CURP,
      matricula: datos.Matricula,
      nombre: datos.Nombres || datos.Nombre,
      apellidoPaterno: datos.ApellidoPaterno,
      apellidoMaterno: datos.ApellidoMaterno,
      fechaNacimiento: datos.FechaNacimiento
        ? this.formatearFecha(datos.FechaNacimiento)
        : '',
      sexo: datos.Sexo,
      telefono: datos.Telefono,
      correo: datos.Correo,
      idSede: datos.IdSede,
      estadoCivil: this.mapearEstadoCivil(datos.EstadoCivil),
      idNacionalidad: mapearNacionalidad(datos.Nacionalidad),
      hablaLengua: mapearBooleano(datos.HablaLengua),
      idLengua: datos.IdLengua,
      tieneBeca: mapearBooleano(datos.TieneBeca),
      queBeca: datos.QueBeca || '',
      hijoDeTrabjador: datos.HijoDeTrabajador ? 'true' : 'false',
      idCapturo: datos.IdCapturo,
      fechaTramite: datos.FechaTramite
        ? this.formatearFecha(datos.FechaTramite)
        : '',
      fechaCaptura: datos.FechaCaptura
        ? this.formatearFecha(datos.FechaCaptura)
        : '',
      idRol: datos.IdRol,
      tieneAlergias:
        datos.Alergias && datos.Alergias !== 'Sin alergias' ? 1 : 0,
      alergias:
        datos.Alergias && datos.Alergias !== 'Sin alergias'
          ? datos.Alergias
          : '',
      tipoSangre: datos.TipoSangre ? datos.TipoSangre.trim() : '',
      tieneDiscapacidad:
        datos.Discapacidad && datos.Discapacidad !== 'Sin discapacidad' ? 1 : 0,
      discapacidad:
        datos.Discapacidad && datos.Discapacidad !== 'Sin discapacidad'
          ? datos.Discapacidad
          : '',
      nombreTutor: datos.NombreDelTutor || '',
      apellidoPaternoTutor: datos.ApellidoPaternoDelTutor || '',
      apellidoMaternoTutor: datos.ApellidoMaternoDelTutor || '',
      telefonoTutor: datos.TelefonoDelTutor || '',
      codigoPostal: datos.CodigoPostal || '',
      calle: datos.Calle || '',
      entreCalles: datos.EntreCalles || '',
      numeroExterior: datos.NumeroExterior || '',
      numeroInterior: datos.NumeroInterior || '',
      idLocalidad: datos.IdLocalidad || '',
    };

    // Actualizar solo los campos que no sean nulos o vacíos
    Object.keys(camposAMapear).forEach((key) => {
      const valor = camposAMapear[key as keyof typeof camposAMapear];
      if (valor !== null && valor !== undefined && valor !== '') {
        this.formulario.patchValue({ [key]: valor });
      }
    });

    // Si hay datos de lengua, cargarlos
    if (datos.IdLengua) {
      this.lenguaSeleccionada = {
        Id: datos.IdLengua,
        Nombre: datos.NombreLengua || 'Lengua cargada',
      };
      this.formulario.patchValue({
        idLengua: datos.IdLengua,
        lenguaSearch: datos.NombreLengua || '',
      });
    }

    // Si hay datos de localidad, se cargan
    if (datos.IdLocalidad) {
      this.localidadSeleccionada = {
        Id: datos.IdLocalidad,
        Nombre: datos.Localidad || 'Localidad cargada',
      };
      this.formulario.patchValue({
        idLocalidad: datos.IdLocalidad,
        localidadSearch: datos.Localidad || '',
      });
    }

    // Cambiar título con el nombre del alumno
    if (datos.Nombre) {
      this.titleService.setTitle(
        `Editando: ${datos.Nombre} ${datos.ApellidoPaterno}`
      );
    }
  }

  private configurarControlesCondicionales() {
    // Configurar lengua
    const hablaLengua = this.formulario.get('hablaLengua')?.value;
    if (hablaLengua === '0') {
      this.toggleEnabled('lenguaSearch', false);
      this.clearLenguaSelection();
    } else if (hablaLengua === '1') {
      this.toggleEnabled('lenguaSearch', true);
    }

    // Configurar beca
    const tieneBeca = this.formulario.get('tieneBeca')?.value;
    if (tieneBeca === '0') {
      this.toggleEnabled('queBeca', false);
    } else if (tieneBeca === '1') {
      this.toggleEnabled('queBeca', true);
    }

    // Configurar alergias
    const tieneAlergias = this.formulario.get('tieneAlergias')?.value;
    if (tieneAlergias === '0') {
      this.toggleEnabled('alergias', false);
    } else if (tieneAlergias === '1') {
      this.toggleEnabled('alergias', true);
    }

    // Configurar discapacidad
    const tieneDiscapacidad = this.formulario.get('tieneDiscapacidad')?.value;
    if (tieneDiscapacidad === '0') {
      this.toggleEnabled('discapacidad', false);
    } else if (tieneDiscapacidad === '1') {
      this.toggleEnabled('discapacidad', true);
    }

    // Configurar campos de tutor basado en la edad
    this.verificarEdadYConfigurarTutor();
  }

  private verificarEdadYConfigurarTutor() {
    const fechaNacimiento = this.formulario.get('fechaNacimiento')?.value;
    if (!fechaNacimiento) return;

    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    const menorEdad = edad <= 18;

    if (menorEdad) {
      this.toggleEnabled('nombreTutor', true);
      this.toggleEnabled('apellidoPaternoTutor', true);
      this.toggleEnabled('apellidoMaternoTutor', true);
      this.toggleEnabled('telefonoTutor', true);
    } else {
      this.toggleEnabled('nombreTutor', false);
      this.toggleEnabled('apellidoPaternoTutor', false);
      this.toggleEnabled('apellidoMaternoTutor', false);
      this.toggleEnabled('telefonoTutor', false);

      this.clearField('nombreTutor');
      this.clearField('apellidoPaternoTutor');
      this.clearField('apellidoMaternoTutor');
      this.clearField('telefonoTutor');
    }
  }

  private formatearFecha(fecha: string): string {
    // Convertir la fecha al formato requerido por el input date (YYYY-MM-DD)
    try {
      const date = new Date(fecha);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  onSearchLengua(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim();

    if (this.lenguaSeleccionada && term !== this.lenguaSeleccionada.Nombre) {
      this.lenguaSeleccionada = null;
      this.formulario.patchValue({
        idLengua: '',
      });
    }

    this.terminoLengua.next(term);
  }

  selectLengua(lengua: any) {
    this.lenguaSeleccionada = lengua;
    this.formulario.patchValue({
      idLengua: lengua.Id,
      lenguaSearch: lengua.Nombre,
    });
    this.lenguasFiltradas = [];
  }

  clearLenguaSelection() {
    this.lenguaSeleccionada = null;
    this.formulario.patchValue({
      idLengua: '',
      lenguaSearch: '',
    });
    this.lenguasFiltradas = [];
  }

  hasLenguaSelected(): boolean {
    return this.lenguaSeleccionada !== null;
  }

  onSearchLocalidad(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim();

    if (
      this.localidadSeleccionada &&
      term !== this.localidadSeleccionada.Nombre
    ) {
      this.localidadSeleccionada = null;
      this.formulario.patchValue({
        idLocalidad: '',
      });
    }

    this.terminoLocalidad.next(term);
  }

  selectLocalidad(localidad: any) {
    this.localidadSeleccionada = localidad;
    this.formulario.patchValue({
      idLocalidad: localidad.Id,
      localidadSearch: localidad.NombreLocalidad || localidad.Nombre,
    });
    this.localidadesFiltradas = [];
  }

  clearLocalidadSelection() {
    this.localidadSeleccionada = null;
    this.formulario.patchValue({
      idLocalidad: '',
      localidadSearch: '',
    });
    this.localidadesFiltradas = [];
  }

  hasLocalidadSelected(): boolean {
    return this.localidadSeleccionada !== null;
  }

  toggleEnabled(name: string, value: boolean) {
    const control = this.formulario.get(name);
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
    const control = this.formulario.get(name);
    if (control) {
      control.setValue('');
    }
  }

  menorEdad(): boolean {
    const fechaNacimiento = this.formulario.get('fechaNacimiento')?.value;
    if (!fechaNacimiento) return false;

    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    return edad <= 18;
  }

  private mapearEstadoCivil(estadoCivil: string | null): string {
    if (!estadoCivil) {
      return '';
    }

    const estadoLower = estadoCivil.toLowerCase();
    const mapeo: { [key: string]: string } = {
      'soltero': 'S',
      'casado': 'C',
      'divorciado': 'D',
      's': 'S',
      'c': 'C',
      'd': 'D'
    };

    return mapeo[estadoLower] || estadoCivil;
  }

  submit() {
    if (this.formulario.valid) {
      // Usar getRawValue() para incluir campos deshabilitados
      const formData = { ...this.formulario.getRawValue() };
      delete formData.lenguaSearch;
      delete formData.localidadSearch;

      if (formData.hablaLengua === '0') {
        formData.idLengua = '';
      }

      // Convertir idLengua a entero o null
      if (formData.idLengua && formData.idLengua !== '') {
        formData.idLengua = parseInt(formData.idLengua, 10);
      } else {
        formData.idLengua = null;
      }

      // Convertir otros campos numéricos también
      formData.idSede = parseInt(formData.idSede, 10);
      formData.idNacionalidad = parseInt(formData.idNacionalidad, 10);

      if (this.esEdicion && this.idAlumnoEditar) {
        this.cargando = true;
        formData.id = this.idAlumnoEditar;

        // Agregar logging para depurar
        console.log('Datos que se envían a la API:', formData);

        this.api.actualizarAlumno(formData).subscribe({
          next: (response) => {
            console.log('Alumno actualizado exitosamente:', response);
            alert('Los datos del alumno han sido actualizados correctamente');
            this.router.navigate(['/list']);
          },
          error: (error) => {
            console.error('Error completo:', error);

            // Extraer detalles del error de validación
            if (error.status === 422 && error.error && error.error.detail) {
              console.error('Errores de validación:', error.error.detail);

              // Mostrar errores específicos
              const errores = error.error.detail
                .map((err: any) => {
                  return `${err.loc ? err.loc.join(' -> ') : 'Campo'}: ${
                    err.msg
                  }`;
                })
                .join('\n');

              alert(`Errores de validación:\n${errores}`);
            } else {
              alert(
                'Error al actualizar los datos del alumno. Intente nuevamente.'
              );
            }
          },
          complete: () => {
            this.cargando = false;
          },
        });
      } else {
        // Crear nuevo alumno (lógica existente)
        console.log('Datos a enviar:', formData);
        console.log('Tipo de ingreso:', this.tipoIngreso);
      }
    }
  }
}
