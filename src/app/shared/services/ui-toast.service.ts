import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UiToastService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 3500) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snack-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(message: string, duration = 5000) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snack-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  info(message: string, duration = 3500) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snack-info'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  warn(message: string, duration = 4000) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snack-warn'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
