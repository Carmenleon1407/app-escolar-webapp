import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component';

@Component({
  selector: 'app-eventos-lista-screen',
  templateUrl: './eventos-lista-screen.component.html',
  styleUrls: ['./eventos-lista-screen.component.scss']
})
export class EventosListaScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";

  public lista_eventos: any[] = [];

  // Configuración de la tabla
  displayedColumns: string[] = [];
  private allColumns: string[] = [
    'nombre_evento',
    'tipo_evento',
    'fecha_realizacion',
    'hora_inicio',
    'lugar',
    'responsable_evento',
    'cupo_maximo_asistentes'
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosAcademicosService,
    public router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    // Configurar columnas según el rol
    this.configurarColumnasSegunRol();

    this.obtenerEventos();
  }

  // Configurar columnas visibles según el rol del usuario
  configurarColumnasSegunRol() {
    if (this.esAdministrador()) {
      // Administrador ve todas las columnas incluyendo acciones
      this.displayedColumns = [...this.allColumns, 'acciones'];
    } else {
      // Maestros y alumnos no ven la columna de acciones
      this.displayedColumns = [...this.allColumns];
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Obtener lista de eventos
  obtenerEventos() {
    this.eventosService.obtenerEventos().subscribe(
      (response) => {
        // Filtrar eventos según el rol del usuario
        this.lista_eventos = this.filtrarEventosSegunRol(response);
        this.dataSource.data = this.lista_eventos;
      },
      (error) => {
        console.error('Error al obtener eventos:', error);
        alert('Error al cargar la lista de eventos');
      }
    );
  }

  // Filtrar eventos según el rol del usuario
  filtrarEventosSegunRol(eventos: any[]): any[] {
    if (this.esAdministrador()) {
      // Administrador ve todos los eventos
      return eventos;
    } else if (this.esMaestro()) {
      // Maestro ve eventos para Profesores y Público general
      return eventos.filter(evento => {
        const publicos = evento.publico_objetivo || [];
        return publicos.includes('Profesores') || publicos.includes('Público general');
      });
    } else if (this.esAlumno()) {
      // Alumno ve eventos para Estudiantes y Público general
      return eventos.filter(evento => {
        const publicos = evento.publico_objetivo || [];
        return publicos.includes('Estudiantes') || publicos.includes('Público general');
      });
    }
    return eventos;
  }

  // Verificar si el usuario es administrador
  esAdministrador(): boolean {
    return this.rol === 'Administrador';
  }

  // Verificar si el usuario es maestro
  esMaestro(): boolean {
    return this.rol === 'Maestro';
  }

  // Verificar si el usuario es alumno
  esAlumno(): boolean {
    return this.rol === 'Alumno';
  }

  // Filtro de búsqueda
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Editar evento (solo administrador)
  editarEvento(evento: any) {
    if (!this.esAdministrador()) {
      alert('Solo los administradores pueden editar eventos');
      return;
    }
    // Navegar a la pantalla de edición con el ID del evento
    this.router.navigate(['/eventos-academicos'], { queryParams: { id: evento.id } });
  }

  // Eliminar evento (solo administrador)
  eliminarEvento(evento: any) {
    if (!this.esAdministrador()) {
      alert('Solo los administradores pueden eliminar eventos');
      return;
    }

    const dialogRef = this.dialog.open(EliminarEventoModalComponent, {
      width: '400px',
      data: { nombreEvento: evento.nombre_evento }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.eventosService.eliminarEvento(evento.id).subscribe(
          (response) => {
            alert('Evento eliminado exitosamente');
            this.obtenerEventos(); // Recargar la lista
          },
          (error) => {
            console.error('Error al eliminar evento:', error);
            alert('Error al eliminar el evento');
          }
        );
      }
    });
  }
}
