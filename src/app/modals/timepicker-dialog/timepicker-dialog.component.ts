import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-timepicker-dialog',
  templateUrl: './timepicker-dialog.component.html',
  styleUrls: ['./timepicker-dialog.component.scss']
})
export class TimepickerDialogComponent {

  public hora: number;
  public minuto: number;

  constructor(
    public dialogRef: MatDialogRef<TimepickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.hora = data.hora || 0;
    this.minuto = data.minuto || 0;
  }

  /**
   * Incrementa la hora
   */
  incrementarHora() {
    if (this.hora < 23) {
      this.hora++;
    } else {
      this.hora = 0;
    }
  }

  /**
   * Decrementa la hora
   */
  decrementarHora() {
    if (this.hora > 0) {
      this.hora--;
    } else {
      this.hora = 23;
    }
  }

  /**
   * Incrementa el minuto
   */
  incrementarMinuto() {
    if (this.minuto < 59) {
      this.minuto += 5;
    } else {
      this.minuto = 0;
    }
  }

  /**
   * Decrementa el minuto
   */
  decrementarMinuto() {
    if (this.minuto >= 5) {
      this.minuto -= 5;
    } else {
      this.minuto = 55;
    }
  }

  /**
   * Permite entrada directa de hora
   */
  onHoraChange(event: any) {
    let valor = parseInt(event.target.value) || 0;
    if (valor > 23) valor = 23;
    if (valor < 0) valor = 0;
    this.hora = valor;
  }

  /**
   * Permite entrada directa de minuto
   */
  onMinutoChange(event: any) {
    let valor = parseInt(event.target.value) || 0;
    if (valor > 59) valor = 59;
    if (valor < 0) valor = 0;
    this.minuto = valor;
  }

  /**
   * Confirma la selección
   */
  confirmar() {
    this.dialogRef.close({ hora: this.hora, minuto: this.minuto });
  }

  /**
   * Cancela la selección
   */
  cancelar() {
    this.dialogRef.close();
  }
}
