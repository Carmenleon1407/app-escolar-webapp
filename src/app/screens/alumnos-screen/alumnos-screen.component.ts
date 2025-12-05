import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from '../../modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_alumnos: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'ocupacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<any>(this.lista_alumnos as any[]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = (this.facadeService.getUserGroup() || '').toLowerCase();
    //Validar que haya inicio de sesión
    this.token = this.facadeService.getSessionToken();
    if (this.token == '') {
      this.router.navigate(['/']);
    }
    //Obtener alumnos
    this.obtenerAlumnos();
  }

  // Obtener lista de alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log('Lista alumnos: ', this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          this.dataSource = new MatTableDataSource<any>(this.lista_alumnos as any[]);
          this.dataSource.paginator = this.paginator;
          if (this.sort) {
            this.dataSource.sort = this.sort;
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'nombre': return ((item.first_name || '') + ' ' + (item.last_name || '')).toLowerCase();
                case 'matricula': return (item.matricula || '').toString();
                default:
                  const value = item[property];
                  return (value === null || value === undefined) ? '' : value.toString().toLowerCase();
              }
            };
            this.dataSource.filterPredicate = (data, filter) => {
              const f = (filter || '').toLowerCase();
              const fullName = ((data.first_name || '') + ' ' + (data.last_name || '')).toLowerCase();
              const matricula = (data.matricula || '').toString().toLowerCase();
              const email = (data.email || (data.user && data.user.email) || '').toLowerCase();
              return fullName.includes(f) || matricula.includes(f) || email.includes(f);
            };
          }
        }
      }, (error) => {
        console.error('Error al obtener la lista de alumnos: ', error);
        alert('No se pudo obtener la lista de alumnos');
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(['registro-usuarios/alumnos/' + idUser]);
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión
    const userIdSession = Number(this.facadeService.getUserId());
    // Administrador puede eliminar cualquier alumno
    // Alumno solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'alumno' && userIdSession === idUser)) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' },
        height: '288px',
        width: '328px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.isDelete) {
          // Actualizar lista en memoria sin recargar la página
          this.lista_alumnos = this.lista_alumnos.filter(a => {
            const uid = a.user ? a.user.id : a.id;
            return uid !== idUser;
          });
          this.dataSource.data = this.lista_alumnos;
          if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
          alert('Alumno eliminado correctamente.');
        } else {
          alert('Alumno no se ha podido eliminar.');
        }
      });
    } else {
      alert('No tienes permisos para eliminar este alumno.');
    }
  }

  // Filtrado por texto (nombre / apellidos)
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

}
