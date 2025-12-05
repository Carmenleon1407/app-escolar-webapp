import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};
  @Input() editar: boolean = false;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Inicializar el esquema SOLO si no recibimos datos_user desde el parent
    if (!this.datos_user) {
      this.alumno = this.alumnosService.esquemaAlumno();
      // Rol del usuario
      this.alumno.rol = this.rol;
    }
    console.log("Datos alumno (init): ", this.alumno);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Si el componente recibe datos_user desde el parent (modo editar), precargar
    if (changes['datos_user'] && this.datos_user) {
      this.editar = true;
      const du = this.datos_user;
      // Log serializado para ver la estructura real
      try { console.log('ngOnChanges - datos_user (alumno):', JSON.stringify(du)); } catch(e) { console.log('ngOnChanges - datos_user (alumno):', du); }
      // Normalizar y mergear user con payload
      const userObj = du.user ? Object.assign({}, du.user, du) : du;
      this.alumno = this.alumnosService.esquemaAlumno();
      this.alumno.id = userObj.id || userObj.user?.id || this.alumno.id;
      this.alumno.first_name = userObj.first_name || '';
      this.alumno.last_name = userObj.last_name || '';
      this.alumno.email = userObj.email || '';
      this.alumno.matricula = userObj.matricula || '';
      this.alumno.curp = userObj.curp || '';
      this.alumno.rfc = userObj.rfc || '';
      this.alumno.fecha_nacimiento = userObj.fecha_nacimiento || '';
      this.alumno.edad = userObj.edad || '';
      this.alumno.telefono = userObj.telefono || '';
      this.alumno.ocupacion = userObj.ocupacion || '';
      try { console.log('Datos alumno:', JSON.stringify(this.alumno)); } catch(e) { console.log('Datos alumno:', this.alumno); }
      console.log('Campo first_name:', this.alumno.first_name, 'matricula:', this.alumno.matricula);
      // Forzar detección de cambios para asegurar que los valores se muestren
      try { this.cd.detectChanges(); } catch(e) { /* ignore */ }
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    // Lógica para registrar un nuevo alumno
    if(this.alumno.password == this.alumno.confirmar_password){
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Alumno registrado exitosamente");
          console.log("Alumno registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["alumnos"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          alert("Error al registrar alumno");
          console.error("Error al registrar alumno: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizar(){
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, true);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response) => {
        alert("Alumno actualizado correctamente");
        console.log("Alumno actualizado: ", response);
        this.router.navigate(["alumnos"]);
      },
      (error) => {
        alert("Error al actualizar alumno");
        console.error("Error al actualizar alumno: ", error);
      }
    );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.alumno.fecha_nacimiento);
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

}
