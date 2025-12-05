import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  //Agregar chartjs-plugin-datalabels
  //Variables

  public total_user: any = {};
  public eventos: any[] = [];
  public eventosMap: Map<string, number> = new Map();

  //Histograma
  lineChartData: any = {
    labels: [],
    datasets: [
      {
        data:[],
        label: 'Registro de materias',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData: any = {
    labels: [],
    datasets: [
      {
        data:[],
        label: 'Eventos Académicos',
        backgroundColor: []
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService,
    private eventosService: EventosAcademicosService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerEventosAcademicos();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Actualizar las gráficas con datos dinámicos
        this.actualizarGraficasUsuarios();
      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

  // Obtener eventos académicos
  public obtenerEventosAcademicos(){
    this.eventosService.obtenerEventos().subscribe(
      (response) => {
        this.eventos = response;
        console.log("Eventos académicos: ", this.eventos);

        // Procesar eventos para gráficas
        this.procesarEventosParaGraficas();
      }, (error) => {
        console.log("Error al obtener eventos académicos ", error);
      }
    );
  }

  // Procesar eventos para obtener estadísticas
  private procesarEventosParaGraficas() {
    this.eventosMap.clear();

    // Contar eventos por tipo
    this.eventos.forEach(evento => {
      const tipo = evento.tipo_evento || 'Sin especificar';
      const count = this.eventosMap.get(tipo) || 0;
      this.eventosMap.set(tipo, count + 1);
    });

    // Actualizar gráficas de eventos
    this.actualizarGraficasEventos();
  }

  // Actualizar gráficas de eventos
  private actualizarGraficasEventos() {
    const labels = Array.from(this.eventosMap.keys());
    const data = Array.from(this.eventosMap.values());

    const colores = [
      '#F88406',
      '#FCFF44',
      '#82D3FB',
      '#FB82F5',
      '#2AD84A',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1'
    ];

    // Actualizar gráfica de línea (histograma)
    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Eventos por tipo',
          backgroundColor: '#F88406',
          borderColor: '#F88406',
          fill: false
        }
      ]
    };

    // Actualizar gráfica de barras
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Eventos Académicos',
          backgroundColor: colores.slice(0, labels.length)
        }
      ]
    };
  }

  // Actualizar gráficas con datos dinámicos de usuarios
  private actualizarGraficasUsuarios() {
    const totalAdmins = this.total_user.administradores || 0;
    const totalMaestros = this.total_user.maestros || 0;
    const totalAlumnos = this.total_user.alumnos || 0;

    // Actualizar gráfica circular
    this.pieChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [
        {
          data: [totalAdmins, totalMaestros, totalAlumnos],
          label: 'Registro de usuarios',
          backgroundColor: [
            '#FCFF44',
            '#F1C8F2',
            '#31E731'
          ]
        }
      ]
    };

    // Actualizar gráfica de dona
    this.doughnutChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [
        {
          data: [totalAdmins, totalMaestros, totalAlumnos],
          label: 'Registro de usuarios',
          backgroundColor: [
            '#F88406',
            '#FCFF44',
            '#31E7E7'
          ]
        }
      ]
    };
  }
}
