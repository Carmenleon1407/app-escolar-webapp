import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventosAcademicosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  /**
   * Obtiene el esquema base para un evento académico
   */
  public esquemaEvento() {
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_realizacion': '',
      'hora_inicio': '',
      'hora_final': '',
      'lugar': '',
      'publico_objetivo': '',
      'programa_educativo': '',
      'responsable_evento': '',
      'descripcion_breve': '',
      'cupo_maximo_asistentes': ''
    };
  }

  /**
   * Registrar un nuevo evento académico
   * @param evento Objeto con los datos del evento
   * @returns Observable con la respuesta del servidor
   */
  public registrarEvento(evento: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    const url = `${environment.url_api}/eventos/`;
    return this.http.post(url, evento, { headers });
  }

  /**
   * Obtener lista de todos los eventos académicos
   * @returns Observable con la lista de eventos
   */
  public obtenerEventos(): Observable<any[]> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
    const url = `${environment.url_api}/eventos/`;
    return this.http.get<any[]>(url, { headers });
  }

  /**
   * Obtener un evento específico por ID
   * @param id ID del evento
   * @returns Observable con los datos del evento
   */
  public obtenerEventoPorId(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
    const url = `${environment.url_api}/eventos/${id}/`;
    return this.http.get<any>(url, { headers });
  }

  /**
   * Actualizar un evento académico
   * @param id ID del evento
   * @param evento Objeto con los datos actualizados
   * @returns Observable con la respuesta del servidor
   */
  public actualizarEvento(id: number, evento: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    const url = `${environment.url_api}/eventos/${id}/`;
    return this.http.put(url, evento, { headers });
  }

  /**
   * Eliminar un evento académico
   * @param id ID del evento
   * @returns Observable con la respuesta del servidor
   */
  public eliminarEvento(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
    const url = `${environment.url_api}/eventos/${id}/`;
    return this.http.delete(url, { headers });
  }

  /**
   * Obtener programas educativos
   * @returns Observable con la lista de programas
   */
  public obtenerProgramasEducativos(): Observable<any[]> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
    return this.http.get<any[]>(`${environment.url_api}/api/programas-educativos/`, { headers });
  }
}
