import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  //Agregar chartjs-plugin-datalabels
  //Variables

  public total_user: any = {};

  //Histograma
  lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data:[89, 34, 43, 54, 28, 74, 93],
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
  barChartData = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data:[34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[89, 34, 43],
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
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[89, 34, 43],
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
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Actualizar las gráficas con datos dinámicos
        this.actualizarGraficas();
      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

  // Actualizar gráficas con datos dinámicos
  private actualizarGraficas() {
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

    // Actualizar histograma con totales
    this.lineChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [
        {
          data: [totalAdmins, totalMaestros, totalAlumnos],
          label: 'Total de usuarios por rol',
          backgroundColor: '#F88406'
        }
      ]
    };

    // Actualizar gráfica de barras
    this.barChartData = {
      labels: ["Administradores", "Maestros", "Alumnos"],
      datasets: [
        {
          data: [totalAdmins, totalMaestros, totalAlumnos],
          label: 'Usuarios registrados',
          backgroundColor: [
            '#F88406',
            '#FCFF44',
            '#82D3FB'
          ]
        }
      ]
    };
  }

}
