import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";

@Injectable({
  providedIn: "root",
})
export class PagesViewsService {
  constructor(private _httpClient: HttpClient) {}

  guardarEmail(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/correosLanding/create/`,
      datos
    );
  }

  actualizarCorreo(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/correosLanding/update/${datos.id}`,
      datos
    );
  }
  getlistaProductosfree(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/productos/list-free/`,
      datos
    );
  }
  getlistaProductos(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/productos/list/`,
      datos
    );
  }
}
