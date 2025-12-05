import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};
  @Input() editar: boolean = false;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {};
  public errors:any = {};
  public token: string = "";
  public idUser: Number = 0;


  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Inicializar el esquema SOLO si no recibimos datos_user desde el parent
    if (!this.datos_user) {
      this.maestro = this.maestrosService.esquemaMaestro();
      // Rol del usuario
      this.maestro.rol = this.rol;
    }
    console.log("Datos maestro (init): ", this.maestro);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datos_user'] && this.datos_user) {
      this.editar = true;
      const du = this.datos_user;
      // Log serializado para ver la estructura real que llega
      try { console.log('ngOnChanges - datos_user (maestro):', JSON.stringify(du)); } catch(e) { console.log('ngOnChanges - datos_user (maestro):', du); }
      this.maestro = this.maestrosService.esquemaMaestro();
      // Normalizar: preferir campos en du.user si existen, y hacer merge
      const userObj = du.user ? Object.assign({}, du.user, du) : du;
      this.maestro.id = userObj.id || userObj.user?.id || this.maestro.id;
      this.maestro.first_name = userObj.first_name || '';
      this.maestro.last_name = userObj.last_name || '';
      this.maestro.email = userObj.email || '';
      this.maestro.id_trabajador = userObj.id_trabajador || '';
      this.maestro.fecha_nacimiento = userObj.fecha_nacimiento || '';
      this.maestro.telefono = userObj.telefono || '';
      this.maestro.rfc = userObj.rfc || '';
      this.maestro.cubiculo = userObj.cubiculo || '';
      this.maestro.area_investigacion = userObj.area_investigacion || '';
      try{
        this.maestro.materias_json = Array.isArray(userObj.materias_json) ? userObj.materias_json : JSON.parse(userObj.materias_json || '[]');
      }catch(e){
        this.maestro.materias_json = [];
      }
      try { console.log('Datos maestro:', JSON.stringify(this.maestro)); } catch(e) { console.log('Datos maestro:', this.maestro); }
      console.log('Campo first_name maestro:', this.maestro.first_name, 'id_trabajador:', this.maestro.id_trabajador);
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
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Lógica para registrar un nuevo maestro
    if(this.maestro.password == this.maestro.confirmar_password){
      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Maestro registrado exitosamente");
          console.log("Maestro registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["maestros"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          alert("Error al registrar maestro");
          console.error("Error al registrar maestro: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.maestro.password="";
      this.maestro.confirmar_password="";
    }
  }
  public actualizar(){

    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, true);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response) => {
        alert("Maestro actualizado correctamente");
        console.log("Maestro actualizado: ", response);
        this.router.navigate(["maestros"]);
      },
      (error) => {
        alert("Error al actualizar maestro");
        console.error("Error al actualizar maestro: ", error);
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

    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }


  // Funciones para los checkbox
  public checkboxChange(event:any){
    console.log("Evento: ", event);
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      console.log(event.source.value);
      this.maestro.materias_json.forEach((materia, i) => {
        if(materia == event.source.value){
          this.maestro.materias_json.splice(i,1)
        }
      });
    }
    console.log("Array materias: ", this.maestro);
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
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
