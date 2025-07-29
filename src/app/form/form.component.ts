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
import { HeaderComponent } from '../header/header.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent],
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

  cargando = false;

  formularioEnviado = false;

  // Agregar propiedades para manejo de documentos
  documentosRequeridos: string[] = [];
  archivosCargados: { [key: string]: File | null } = {};
  documentosExistentes: { [key: string]: any } = {}; // Nueva propiedad para documentos de BD

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private titleService: Title
  ) {
    this.formulario = this.fb.group({
      id: [null],
      curp: [''],
      matricula: [''],
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
    // Configurar documentos requeridos basado en tipoIngreso
    this.configurarDocumentosRequeridos();

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
      sexo:
        datos.Sexo === 'F'
          ? 'M'
          : datos.Sexo === 'M'
          ? 'H'
          : datos.Sexo === 'H' || datos.Sexo === 'M'
          ? datos.Sexo
          : '',
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

    // Procesar documentos existentes
    this.procesarDocumentosExistentes(datos);
  }

  // Nuevo método para procesar documentos existentes
  private procesarDocumentosExistentes(datos: any) {
    if (datos.Documentos) {
      try {
        let documentos: any[] = [];

        // Si Documentos es un string, parsearlo como JSON
        if (typeof datos.Documentos === 'string') {
          documentos = JSON.parse(datos.Documentos);
        } else {
          documentos = datos.Documentos;
        }

        // Procesar cada documento existente
        documentos.forEach((doc: any) => {
          // Extraer el tipo de documento del campo NombreArchivo
          // El formato es: "TipoDocumento|NombreRealDelArchivo"
          const nombreCompleto = doc.NombreArchivo;
          const separadorIndex = nombreCompleto.indexOf('|');

          if (separadorIndex > -1) {
            const tipoDocumento = nombreCompleto.substring(0, separadorIndex);
            const nombreArchivo = nombreCompleto.substring(separadorIndex + 1);

            // Guardar la información del documento existente
            this.documentosExistentes[tipoDocumento] = {
              id: doc.DocumentoId,
              nombreArchivo: nombreArchivo,
              rutaArchivo: doc.RutaArchivo,
              tamanoArchivo: doc.TamanoArchivo,
              fechaSubida: doc.FechaSubida,
            };
          }
        });
      } catch (error) {
        console.error('Error al procesar documentos existentes:', error);
      }
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
      idLocalidad: localidad.id,
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
      soltero: 'S',
      casado: 'C',
      divorciado: 'D',
      s: 'S',
      c: 'C',
      d: 'D',
    };

    return mapeo[estadoLower] || estadoCivil;
  }

  // Documentos requeridos
  private configurarDocumentosRequeridos() {
    // Mapear tipoIngreso a IdRol (siempre usar la lógica de negocio correcta)
    let idRol: number;

    switch (this.tipoIngreso) {
      case 'matricula':
        idRol = 1;
        break;
      case 'primera-vez':
        idRol = 2;
        break;
      case 'otra-institucion':
        idRol = 3;
        break;
      default:
        // Si es edición y no hay tipoIngreso, usar el IdRol existente
        if (this.esEdicion && this.datosAlumno?.IdRol) {
          idRol = this.datosAlumno.IdRol;
        } else {
          idRol = 2; // Por defecto
        }
    }

    // Establecer el IdRol en el formulario
    this.formulario.patchValue({ idRol: idRol });

    // Documentos base para todos los casos
    this.documentosRequeridos = [
      'CURP',
      'Acta de nacimiento actualizada',
      'Certificado de secundaria',
    ];

    // Agregar documentos específicos según el IdRol
    if (idRol === 1) {
      // Matrícula existente
      this.documentosRequeridos.unshift('Constancia de estudios');
    } else if (idRol === 3) {
      // Otra institución
      this.documentosRequeridos.unshift(
        'Formato de solicitud de traslado',
        'Certificado parcial de estudios o constancia con calificaciones',
        'Tira de materias, plan de estudios o mapa curricular'
      );
    }
  }

  // Modificar el método onArchivoSeleccionado para recibir el documento específico
  onArchivoSeleccionado(evento: Event, documento: string) {
    const input = evento.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      // Validar que sea PDF
      if (archivo.type !== 'application/pdf') {
        Swal.fire({
          title: 'Documento inválido',
          text: 'Solo se permiten archivos PDF',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        input.value = '';
        return;
      }

      // Guardar el archivo
      this.archivosCargados[documento] = archivo;

      // Actualizar validación del documento
      this.actualizarValidacionDocumento(documento);

      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente si es necesario
      input.value = '';

      // Mostrar mensaje de éxito
      console.log(`Archivo cargado para ${documento}:`, archivo.name);
    }
  }

  esDocumentoCargado(documento: string): boolean {
    // Verificar si hay un archivo nuevo cargado O si existe en la base de datos
    return (
      this.archivosCargados[documento] !== null ||
      this.documentosExistentes[documento] !== undefined
    );
  }

  esDocumentoValido(documento: string): boolean {
    return this.esDocumentoCargado(documento);
  }

  private actualizarValidacionDocumento(documento: string) {
    const controlName = `documento_${documento
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '')}`;
    const control = this.formulario.get(controlName);
    if (control) {
      if (this.esDocumentoCargado(documento)) {
        control.setValue('valid');
        control.setErrors(null);
      } else {
        control.setValue('');
        control.setErrors({ required: true });
      }
    }
  }

  getNombreArchivo(documento: string): string {
    // Priorizar archivo nuevo cargado, si no, mostrar el existente
    const archivo = this.archivosCargados[documento];
    if (archivo) {
      return archivo.name;
    }

    const documentoExistente = this.documentosExistentes[documento];
    if (documentoExistente) {
      return documentoExistente.nombreArchivo;
    }

    return '';
  }

  eliminarArchivo(documento: string) {
    // Limpiar tanto el archivo nuevo como marcar para eliminar el existente
    this.archivosCargados[documento] = null;

    // Si había un documento existente, marcarlo para eliminación
    if (this.documentosExistentes[documento]) {
      delete this.documentosExistentes[documento];
    }

    // Actualizar validación del documento
    this.actualizarValidacionDocumento(documento);
  }

  // Método para verificar si es un documento existente (no un archivo nuevo)
  esDocumentoExistente(documento: string): boolean {
    return (
      this.archivosCargados[documento] === null &&
      this.documentosExistentes[documento] !== undefined
    );
  }

  // Método para obtener información adicional del documento existente
  getInfoDocumentoExistente(documento: string): any {
    return this.documentosExistentes[documento] || null;
  }

  // Método para verificar si un campo es inválido y el formulario ha sido enviado
  esCampoInvalido(nombreCampo: string): boolean {
    const campo = this.formulario.get(nombreCampo);
    return !!(this.formularioEnviado && campo && campo.invalid);
  }

  getDocumentosCargados(): number {
    return this.documentosRequeridos.filter((doc) =>
      this.esDocumentoCargado(doc)
    ).length;
  }

  getPorcentajeProgreso(): number {
    const total = this.documentosRequeridos.length;
    const cargados = this.getDocumentosCargados();
    return total > 0 ? Math.round((cargados / total) * 100) : 0;
  }

  // Enviar formulario
  submit() {
    this.formularioEnviado = true;

    // Validar documentos requeridos
    let documentosValidos = true;
    this.documentosRequeridos.forEach((doc) => {
      this.actualizarValidacionDocumento(doc);
      if (!this.esDocumentoCargado(doc)) {
        documentosValidos = false;
      }
    });

    if (this.formulario.valid && documentosValidos) {
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

      this.cargando = true;

      if (this.esEdicion && this.idAlumnoEditar) {
        formData.id = this.idAlumnoEditar;

        // Agregar logging para depurar
        console.log('Datos que se envían a la API:', formData);
        console.log('Archivos que se envían a la API:', this.archivosCargados);

        // Usar el nuevo método que incluye archivos
        this.api.actualizarAlumno(formData, this.archivosCargados).subscribe({
          next: (response) => {
            console.log('Alumno actualizado exitosamente:', response);
            Swal.fire({
              title: 'Éxito',
              text: 'Los datos del alumno han sido actualizados correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
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

              Swal.fire({
                title: 'Errores de validación',
                text: errores,
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: 'Error al actualizar los datos del alumno. Intente nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            }
          },
          complete: () => {
            this.cargando = false;
          },
        });
      } else {
        // Crear nuevo alumno con archivos
        console.log('Datos a enviar:', formData);
        console.log('Archivos a enviar:', this.archivosCargados);
        console.log('Tipo de ingreso:', this.tipoIngreso);

        this.api.crearAlumno(formData, this.archivosCargados).subscribe({
          next: (response) => {
            console.log('Alumno creado exitosamente:', response);
            Swal.fire({
              title: 'Éxito',
              text: 'El alumno ha sido registrado correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error al crear alumno:', error);

            if (error.status === 422 && error.error && error.error.detail) {
              const errores = error.error.detail
                .map((err: any) => {
                  return `${err.loc ? err.loc.join(' -> ') : 'Campo'}: ${
                    err.msg
                  }`;
                })
                .join('\n');

              Swal.fire({
                title: 'Errores de validación',
                text: errores,
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: 'Error al registrar el alumno. Intente nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            }
          },
          complete: () => {
            this.cargando = false;
          },
        });
      }
    } else {
      this.formulario.markAllAsTouched();

      if (!this.formulario.valid) {
        Swal.fire({
          title: 'Formulario incompleto',
          text: 'Por favor complete todos los campos requeridos',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
      } else if (!documentosValidos) {
        Swal.fire({
          title: 'Documentos faltantes',
          text: 'Por favor sube todos los documentos requeridos',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
      }
    }
  }
}
