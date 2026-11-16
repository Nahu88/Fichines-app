import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Modal } from '../../servicios/modal';
import { DatosGrafico, EstadisticasService } from '../../servicios/estadisticas';
import { fechaLocal, haceDias, rangoFechasValidator } from '../../validators/fechas.validators';

Chart.register(...registerables);

// Colores y letra de los gráficos, iguales a los de la app.
Chart.defaults.color = '#b9b4d6';
Chart.defaults.borderColor = '#3b3866';
Chart.defaults.font.family = "'Work Sans', system-ui, sans-serif";
const COLORES = ['#f0b429', '#8f87d9', '#5ee08a', '#ff8a8a', '#4cc9f0', '#ff9f1c', '#c77dff', '#e9ff70'];

// Pestaña "Estadísticas": 3 gráficos (barras, líneas y dona) para el lapso elegido.
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-admin-estadisticas',
  templateUrl: './admin-estadisticas.html',
  styleUrl: './admin-estadisticas.css',
})
export class AdminEstadisticas implements AfterViewInit, OnDestroy {
  modal = inject(Modal);
  servicio = inject(EstadisticasService);

  hoy = fechaLocal();
  cargando = signal(false);
  totales = signal({ publicaciones: 0, comentarios: 0 });

  // Arranca en los últimos 30 días.
  formFechas = new FormGroup(
    {
      desde: new FormControl(haceDias(30), { validators: [Validators.required] }),
      hasta: new FormControl(fechaLocal(), { validators: [Validators.required] }),
    },
    { validators: [rangoFechasValidator()] },
  );

  lienzoUsuarios = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzoUsuarios');
  lienzoDias = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzoDias');
  lienzoPublicaciones = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzoPublicaciones');

  private graficos: Chart[] = [];

  // Recién acá existen los <canvas>.
  ngAfterViewInit() {
    this.consultar();
  }

  ngOnDestroy() {
    this.graficos.forEach((g) => g.destroy());
  }

  rapido(dias: number) {
    this.formFechas.setValue({ desde: haceDias(dias), hasta: fechaLocal() });
    this.consultar();
  }

  consultar() {
    if (this.formFechas.invalid) {
      this.formFechas.markAllAsTouched();
      return;
    }
    const { desde, hasta } = this.formFechas.value;

    this.cargando.set(true);
    // forkJoin espera a que lleguen los 3 pedidos.
    forkJoin({
      usuarios: this.servicio.publicacionesPorUsuario(desde!, hasta!),
      dias: this.servicio.comentariosPorDia(desde!, hasta!),
      publicaciones: this.servicio.comentariosPorPublicacion(desde!, hasta!),
    }).subscribe({
      next: (r) => {
        this.cargando.set(false);
        this.totales.set({ publicaciones: this.sumar(r.usuarios), comentarios: this.sumar(r.dias) });
        this.dibujar(r.usuarios, r.dias, r.publicaciones);
      },
      error: (error) => {
        this.cargando.set(false);
        this.modal.mostrarErrorHttp(error);
      },
    });
  }

  private dibujar(usuarios: DatosGrafico, dias: DatosGrafico, publicaciones: DatosGrafico) {
    // Hay que borrar los anteriores antes de reusar el canvas.
    this.graficos.forEach((g) => g.destroy());

    this.graficos = [
      new Chart(this.lienzoUsuarios().nativeElement, {
        type: 'bar',
        data: {
          labels: usuarios.etiquetas,
          datasets: [{ label: 'Publicaciones', data: usuarios.valores, backgroundColor: COLORES[0], maxBarThickness: 70 }],
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
      }),

      new Chart(this.lienzoDias().nativeElement, {
        type: 'line',
        data: {
          labels: dias.etiquetas,
          datasets: [
            {
              label: 'Comentarios',
              data: dias.valores,
              borderColor: COLORES[1],
              backgroundColor: COLORES[1],
              tension: 0.25,
            },
          ],
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
      }),

      new Chart(this.lienzoPublicaciones().nativeElement, {
        type: 'doughnut',
        data: {
          labels: publicaciones.etiquetas,
          datasets: [{ data: publicaciones.valores, backgroundColor: COLORES, borderColor: '#24224a' }],
        },
        options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      }),
    ];
  }

  private sumar(datos: DatosGrafico) {
    return datos.valores.reduce((total, v) => total + v, 0);
  }

  // Para el cartel "Sin datos".
  vacio(lienzo: 'usuarios' | 'dias' | 'publicaciones') {
    if (lienzo === 'dias') return this.totales().comentarios === 0;
    if (lienzo === 'usuarios') return this.totales().publicaciones === 0;
    return this.totales().comentarios === 0;
  }
}
