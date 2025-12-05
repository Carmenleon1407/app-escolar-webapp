import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { TimepickerDialogComponent } from 'src/app/modals/timepicker-dialog/timepicker-dialog.component';

@Component({
  selector: 'app-eventos-academicos-screen',
  templateUrl: './eventos-academicos-screen.component.html',
  styleUrls: ['./eventos-academicos-screen.component.scss']
})
export class EventosAcademicosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";

  // Formulario
  public formularioEvento: FormGroup;
  public programasEducativos: any[] = [];
  public mostrarProgramaEducativo: boolean = false;

  // Listas de responsables
  public listaMaestros: any[] = [];
  public listaAdministradores: any[] = [];
  public listaResponsables: any[] = [];

  // Opciones para select y checkboxes
  public tiposEvento: string[] = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  public publicosObjetivo: any[] = [
    { valor: 'Estudiantes', seleccionado: false },
    { valor: 'Profesores', seleccionado: false },
    { valor: 'Público general', seleccionado: false }
  ];

  constructor(
    private fb: FormBuilder,
    public facadeService: FacadeService,
    public eventosService: EventosAcademicosService,
    public maestrosService: MaestrosService,
    public administradoresService: AdministradoresService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.formularioEvento = this.fb.group({
      nombre_evento: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        this.validarNombreEvento.bind(this)
      ]],
      tipo_evento: ['', [Validators.required]],
      fecha_realizacion: ['', [
        Validators.required,
        this.validarFechaFutura.bind(this)
      ]],
      hora_inicio: ['', [Validators.required]],
      hora_final: ['', [Validators.required]],
      lugar: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        this.validarLugar.bind(this)
      ]],
      publico_objetivo: [[], [Validators.required, this.validarArrayNoVacio.bind(this)]],
      programa_educativo: ['', []],
      responsable_evento: ['', [Validators.required]],
      descripcion_breve: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(300),
        this.validarDescripcion.bind(this)
      ]],
      cupo_maximo_asistentes: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(999),
        Validators.pattern(/^[0-9]{1,3}$/)
      ]]
    }, { validators: this.validarHorarios.bind(this) });
  }

  /**
   * Validador personalizado para nombre del evento
   * Solo permite letras, números y espacios
   */
  private validarNombreEvento(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Patrón: solo letras (mayúsculas y minúsculas), números y espacios
    const pattern = /^[a-zA-Z0-9\s]+$/;
    if (!pattern.test(value)) {
      return { 'caracteres_invalidos': true };
    }

    return null;
  }

  /**
   * Validador personalizado para fecha de realización
   * No permite fechas anteriores a hoy
   */
  private validarFechaFutura(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Obtener la fecha seleccionada
    const fechaSeleccionada = new Date(value);
    // Obtener la fecha de hoy sin hora
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Comparar si la fecha es anterior a hoy
    if (fechaSeleccionada < hoy) {
      return { 'fecha_pasada': true };
    }

    return null;
  }

  /**
   * Validador personalizado para lugar
   * Solo permite caracteres alfanuméricos y espacios
   */
  private validarLugar(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Patrón: solo letras (mayúsculas y minúsculas), números y espacios
    const pattern = /^[a-zA-Z0-9\s]+$/;
    if (!pattern.test(value)) {
      return { 'caracteres_invalidos_lugar': true };
    }

    return null;
  }

  /**
   * Validador a nivel de formulario para horarios
   * Verifica que hora_inicio < hora_final
   */
  private validarHorarios(formGroup: AbstractControl): ValidationErrors | null {
    const horaInicio = formGroup.get('hora_inicio')?.value;
    const horaFinal = formGroup.get('hora_final')?.value;

    if (!horaInicio || !horaFinal) {
      return null;
    }

    // Comparar las horas
    if (horaInicio >= horaFinal) {
      formGroup.get('hora_final')?.setErrors({ 'hora_invalida': true });
      return { 'horas_invalidas': true };
    } else {
      // Limpiar el error si la validación es correcta
      const errors = formGroup.get('hora_final')?.errors;
      if (errors) {
        delete errors['hora_invalida'];
        if (Object.keys(errors).length === 0) {
          formGroup.get('hora_final')?.setErrors(null);
        }
      }
    }

    return null;
  }

  /**
   * Validador personalizado para arrays
   * Verifica que el array tenga al menos un elemento
   */
  private validarArrayNoVacio(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value || !Array.isArray(value) || value.length === 0) {
      return { 'array_vacio': true };
    }

    return null;
  }

  /**
   * Validador personalizado para descripción
   * Solo permite letras, números y signos de puntuación básicos
   */
  private validarDescripcion(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Patrón: letras, números, espacios y puntuación básica (. , ; : ¿? ¡! () "")
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¿?¡!()"]+$/;
    if (!pattern.test(value)) {
      return { 'caracteres_invalidos_descripcion': true };
    }

    return null;
  }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token == "") {
      this.router.navigate(["/"]);
      return;
    }

    // Verificar que solo administradores puedan registrar eventos
    if (this.rol !== 'Administrador') {
      alert('Solo los administradores pueden registrar eventos académicos');
      this.router.navigate(['/eventos-lista']);
      return;
    }

    // Escuchar cambios en público objetivo
    this.formularioEvento.get('publico_objetivo')?.valueChanges.subscribe((value) => {
      this.onPublicoObjetivoChange(value);
    });

    // Obtener programas educativos
    this.obtenerProgramasEducativos();

    // Obtener lista de maestros y administradores
    this.obtenerMaestros();
    this.obtenerAdministradores();
  }

  // Cuando cambia el público objetivo, mostrar/ocultar programa educativo
  onPublicoObjetivoChange(value: string[]) {
    // Mostrar programa educativo si se selecciona "Estudiantes"
    if (value && value.includes('Estudiantes')) {
      this.mostrarProgramaEducativo = true;
      this.formularioEvento.get('programa_educativo')?.setValidators([Validators.required]);
    } else {
      this.mostrarProgramaEducativo = false;
      this.formularioEvento.get('programa_educativo')?.clearValidators();
      this.formularioEvento.get('programa_educativo')?.setValue('');
    }
    this.formularioEvento.get('programa_educativo')?.updateValueAndValidity();
  }

  // Manejar el cambio de checkbox
  onCheckboxChange(event: any, publico: any) {
    const publicosSeleccionados: string[] = this.formularioEvento.get('publico_objetivo')?.value || [];

    if (event.checked) {
      // Agregar a la lista
      publicosSeleccionados.push(publico.valor);
    } else {
      // Remover de la lista
      const index = publicosSeleccionados.indexOf(publico.valor);
      if (index >= 0) {
        publicosSeleccionados.splice(index, 1);
      }
    }

    this.formularioEvento.patchValue({
      publico_objetivo: publicosSeleccionados
    });

    this.formularioEvento.get('publico_objetivo')?.markAsTouched();
    this.onPublicoObjetivoChange(publicosSeleccionados);
  }

  // Verificar si un checkbox está seleccionado
  isCheckboxChecked(valor: string): boolean {
    const publicosSeleccionados: string[] = this.formularioEvento.get('publico_objetivo')?.value || [];
    return publicosSeleccionados.includes(valor);
  }

  // Obtener programas educativos del backend
  obtenerProgramasEducativos() {
    // Aquí se consume el servicio para obtener programas educativos
    // Por ahora usamos datos ficticios con las carreras de la FCC
    this.programasEducativos = [
      { id: 1, nombre: 'Ingeniería en Ciencias de la Computación' },
      { id: 2, nombre: 'Licenciatura en Ciencias de la Computación' },
      { id: 3, nombre: 'Ingeniería en Tecnologías de la Información' }
    ];
  }

  // Obtener lista de maestros
  obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.listaMaestros = response;
        this.combinarResponsables();
      },
      (error) => {
        console.error('Error al obtener maestros:', error);
      }
    );
  }

  // Obtener lista de administradores
  obtenerAdministradores() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.listaAdministradores = response;
        this.combinarResponsables();
      },
      (error) => {
        console.error('Error al obtener administradores:', error);
      }
    );
  }

  // Combinar maestros y administradores en una sola lista
  combinarResponsables() {
    this.listaResponsables = [];

    // Agregar maestros
    this.listaMaestros.forEach(maestro => {
      this.listaResponsables.push({
        id: maestro.user?.id || maestro.id,
        nombre: `${maestro.user?.first_name || maestro.first_name} ${maestro.user?.last_name || maestro.last_name}`,
        tipo: 'Maestro'
      });
    });

    // Agregar administradores
    this.listaAdministradores.forEach(admin => {
      this.listaResponsables.push({
        id: admin.user?.id || admin.id,
        nombre: `${admin.user?.first_name || admin.first_name} ${admin.user?.last_name || admin.last_name}`,
        tipo: 'Administrador'
      });
    });
  }

  /**
   * Obtiene el mensaje de error de un control del formulario
   */
  obtenerMensajeError(nombreControl: string): string {
    const control = this.formularioEvento.get(nombreControl);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.obtenerLabelControl(nombreControl)} es obligatorio`;
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${this.obtenerLabelControl(nombreControl)} debe tener al menos ${minLength} caracteres`;
    }

    if (control.errors['minLength']) {
      return 'Debe seleccionar al menos una opción';
    }

    if (control.errors['array_vacio']) {
      return 'Debe seleccionar al menos una opción';
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.obtenerLabelControl(nombreControl)} no puede exceder ${maxLength} caracteres`;
    }

    if (control.errors['pattern']) {
      if (nombreControl === 'cupo_maximo_asistentes') {
        return 'Solo se permiten números';
      }
      return `Formato inválido`;
    }

    if (control.errors['caracteres_invalidos']) {
      return 'Solo se permiten letras, números y espacios';
    }

    if (control.errors['caracteres_invalidos_lugar']) {
      return 'Solo se permiten caracteres alfanuméricos y espacios';
    }

    if (control.errors['caracteres_invalidos_descripcion']) {
      return 'Solo se permiten letras, números y signos de puntuación básicos';
    }

    if (control.errors['fecha_pasada']) {
      return 'La fecha no puede ser anterior a hoy';
    }

    if (control.errors['hora_invalida']) {
      return 'La hora de inicio debe ser menor que la hora final';
    }

    if (control.errors['min']) {
      return `${this.obtenerLabelControl(nombreControl)} debe ser mayor a ${control.errors['min'].min}`;
    }

    if (control.errors['max']) {
      return `${this.obtenerLabelControl(nombreControl)} no puede ser mayor a ${control.errors['max'].max}`;
    }

    return 'Campo inválido';
  }

  /**
   * Obtiene el label legible del control
   */
  private obtenerLabelControl(nombreControl: string): string {
    const labels: { [key: string]: string } = {
      'nombre_evento': 'El nombre del evento',
      'tipo_evento': 'El tipo de evento',
      'fecha_realizacion': 'La fecha de realización',
      'hora_inicio': 'La hora de inicio',
      'hora_final': 'La hora final',
      'lugar': 'El lugar',
      'publico_objetivo': 'El público objetivo',
      'programa_educativo': 'El programa educativo',
      'responsable_evento': 'El responsable',
      'descripcion_breve': 'La descripción',
      'cupo_maximo_asistentes': 'El cupo máximo'
    };
    return labels[nombreControl] || nombreControl;
  }

  /**
   * Verifica si un control tiene error y ha sido tocado
   */
  tieneError(nombreControl: string): boolean {
    const control = this.formularioEvento.get(nombreControl);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Abre el timepicker para seleccionar la hora de inicio
   */
  abrirTimepickerInicio() {
    const horaActual = this.formularioEvento.get('hora_inicio')?.value || '00:00';
    const partes = horaActual.split(':');
    const hora = parseInt(partes[0]) || 0;
    const minuto = parseInt(partes[1]) || 0;

    const dialogRef = this.dialog.open(TimepickerDialogComponent, {
      width: '350px',
      data: { hora, minuto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const horaFormato = `${String(result.hora).padStart(2, '0')}:${String(result.minuto).padStart(2, '0')}`;
        this.formularioEvento.patchValue({
          hora_inicio: horaFormato
        });
        this.formularioEvento.get('hora_inicio')?.markAsTouched();
      }
    });
  }

  /**
   * Abre el timepicker para seleccionar la hora final
   */
  abrirTimepickerFinal() {
    const horaActual = this.formularioEvento.get('hora_final')?.value || '00:00';
    const partes = horaActual.split(':');
    const hora = parseInt(partes[0]) || 0;
    const minuto = parseInt(partes[1]) || 0;

    const dialogRef = this.dialog.open(TimepickerDialogComponent, {
      width: '350px',
      data: { hora, minuto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const horaFormato = `${String(result.hora).padStart(2, '0')}:${String(result.minuto).padStart(2, '0')}`;
        this.formularioEvento.patchValue({
          hora_final: horaFormato
        });
        this.formularioEvento.get('hora_final')?.markAsTouched();
      }
    });
  }

  // Registrar evento
  registrarEvento() {
    if (this.formularioEvento.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.formularioEvento.controls).forEach(key => {
        this.formularioEvento.get(key)?.markAsTouched();
      });
      alert('Por favor, complete todos los campos requeridos correctamente');
      return;
    }

    const eventoData = this.formularioEvento.value;

    this.eventosService.registrarEvento(eventoData).subscribe(
      (response) => {
        alert('Evento registrado exitosamente');
        this.formularioEvento.reset();
        this.router.navigate(['/eventos-lista']);
      },
      (error) => {
        console.error('Error al registrar evento:', error);
        alert('Error al registrar el evento');
      }
    );
  }

  // Limpiar formulario
  limpiarFormulario() {
    this.formularioEvento.reset();
    this.mostrarProgramaEducativo = false;
    Object.keys(this.formularioEvento.controls).forEach(key => {
      this.formularioEvento.get(key)?.markAsUntouched();
    });
  }
}
