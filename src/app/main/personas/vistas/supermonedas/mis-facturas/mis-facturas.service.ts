import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacturaFisicaCalificaciones } from 'app/main/personas/models/supermonedas';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MisFacturasService {

  constructor(private _httpClient: HttpClient) { }

  obtenerFacturas(datos) {
    return this._httpClient.post<any>(`${environment.apiUrl}/central/facturas/list/`, datos);
  }
  subirFacturaElec(datos) {
    return this._httpClient.post<any>(`${environment.apiUrl}/central/facturas/subir/factura/`, datos);
  }
  subirFacturaFisi(datos) {
    return this._httpClient.post<any>(`${environment.apiUrl}/central/facturas/create/`, datos);
  }
  actualizarFactura(datos) {
    delete datos.urlFoto;
    delete datos.urlArchivo;
    return this._httpClient.post<FacturaFisicaCalificaciones>(`${environment.apiUrl}/central/facturas/update/${datos._id}`, datos);
  }
  obtenerFactura(id) {
    return this._httpClient.get<any>(`${environment.apiUrl}/central/facturas/listOne/${id}`,);
  }
}
