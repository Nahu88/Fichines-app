import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Contraseña: al menos 8 caracteres, una mayúscula y un número.
export function passwordFuerteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (valor === '') return null;

    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneNumero = /[0-9]/.test(valor);
    const tieneLargo = valor.length >= 8;

    if (tieneMayuscula && tieneNumero && tieneLargo) {
      return null;
    }
    return { passwordDebil: true };
  };
}

// Va en "repetir contraseña" y recibe el control de la contraseña.
export function clavesCoincidenValidator(controlACoincidir: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value !== controlACoincidir.value) {
      return { clavesNoCoinciden: true };
    }
    return null;
  };
}

// La persona tiene que tener al menos "edad" años.
export function edadMinimaValidator(edad: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const nacimiento = new Date(control.value);
    const limite = new Date();
    limite.setFullYear(limite.getFullYear() - edad);

    if (nacimiento > limite) {
      return { menorDeEdad: true };
    }
    return null;
  };
}