import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo:string = "registro-usuarios";
  public user:any = {};
  public editar:boolean = false;
  public rol:string = "";
  public idUser:number = 0;

  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private alumnosService: AlumnosService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    this.user.tipo_usuario = '';
    //Obtener de la URL el rol para saber cual editar
    if(this.activatedRoute.snapshot.params['rol'] != undefined){
      // Normalizar rol: la UI a veces navega con plurales ('alumnos','maestros')
      const rawRol = this.activatedRoute.snapshot.params['rol'];
      // Mapear plurales a singular (alumnos -> alumno, maestros -> maestro)
      this.rol = rawRol.endsWith('s') ? rawRol.slice(0, -1) : rawRol;
      console.log("Rol detectado: ", this.rol);
    }

    //El if valida si existe un parámetro ID en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista obtiene el usuario por su ID
      this.obtenerUserByID();
    }
  }

  public radioChange(event: MatRadioChange) {
    if(event.value == "administrador"){
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    }else if (event.value == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    }else if (event.value == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }

  //Obtener usuario por ID
  public obtenerUserByID() {
    //Lógica para obtener el usuario según su ID y rol
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);
    //Aquí se haría la llamada al servicio correspondiente según el rol
    if(this.rol == "administrador"){
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          const payload = Array.isArray(response) ? response[0] : response;
          this.user = payload;
          console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = payload.user?.first_name || payload.first_name;
          this.user.last_name = payload.user?.last_name || payload.last_name;
          this.user.email = payload.user?.email || payload.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
          // Mostrar el formulario de administrador aun si la petición falla
          this.isAdmin = true;
        }
      );
    }else if(this.rol == "maestro"){
      this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
        (response) => {
          const payload = Array.isArray(response) ? response[0] : response;
          this.user = payload;
          console.log("Maestro original obtenido: ", this.user);
          this.user.first_name = payload.user?.first_name || payload.first_name;
          this.user.last_name = payload.user?.last_name || payload.last_name;
          this.user.email = payload.user?.email || payload.email;
          this.user.tipo_usuario = this.rol;
          this.isMaestro = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el maestro seleccionado");
          // Mostrar el formulario de maestro aun si la petición falla
          this.isMaestro = true;
        }
      );
    }else if(this.rol == "alumno"){
      this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
        (response) => {
          const payload = Array.isArray(response) ? response[0] : response;
          this.user = payload;
          console.log("Alumno original obtenido: ", this.user);
          this.user.first_name = payload.user?.first_name || payload.first_name;
          this.user.last_name = payload.user?.last_name || payload.last_name;
          this.user.email = payload.user?.email || payload.email;
          this.user.tipo_usuario = this.rol;
          this.isAlumno = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el alumno seleccionado");
          // Mostrar el formulario de alumno aun si la petición falla
          this.isAlumno = true;
        }
      );
    }

  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
