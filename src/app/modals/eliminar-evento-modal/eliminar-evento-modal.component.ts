import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-eliminar-evento-modal',
  templateUrl: './eliminar-evento-modal.component.html',
  styleUrls: ['./eliminar-evento-modal.component.scss']
})
export class EliminarEventoModalComponent {

  constructor(
    public dialogRef: MatDialogRef<EliminarEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  /**
   * Cierra el modal sin eliminar
   */
  cancelar(): void {
    this.dialogRef.close(false);
  }

  /**
   * Confirma la eliminación
   */
  eliminar(): void {
    this.dialogRef.close(true);
  }
}
