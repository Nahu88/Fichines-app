import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador del FormGroup: "desde" no puede ser posterior a "hasta" (iguales sí).
// Las fechas "AAAA-MM-DD" se pueden comparar como texto.
export function rangoFechasValidator(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const desde = grupo.get('desde')?.value;
    const hasta = grupo.get('hasta')?.value;
    if (!desde || !hasta) return null;

    if (desde > hasta) {
      return { rangoInvertido: true };
    }
    return null;
  };
}

// "AAAA-MM-DD" en hora local (toISOString usaría UTC y después de las 21 hs daría mañana).
export function fechaLocal(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function haceDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fechaLocal(fecha);
}
