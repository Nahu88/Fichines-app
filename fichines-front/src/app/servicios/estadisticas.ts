import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';

export interface DatosGrafico {
  etiquetas: string[];
  valores: number[];
}

// Pedidos al controller de estadísticas (solo administradores). Fechas "AAAA-MM-DD".
@Service()
export class EstadisticasService {
  http = inject(HttpClient);

  url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(desde: string, hasta: string) {
    return this.http.get<DatosGrafico>(`${this.url}/publicaciones-por-usuario`, { params: { desde, hasta } });
  }

  comentariosPorDia(desde: string, hasta: string) {
    return this.http.get<DatosGrafico>(`${this.url}/comentarios-por-dia`, { params: { desde, hasta } });
  }

  comentariosPorPublicacion(desde: string, hasta: string) {
    return this.http.get<DatosGrafico>(`${this.url}/comentarios-por-publicacion`, { params: { desde, hasta } });
  }
}
