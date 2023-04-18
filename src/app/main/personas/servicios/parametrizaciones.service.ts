import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment";

@Injectable({
  providedIn: "root",
})
export class ParametrizacionesService {
  constructor(private _httpClient: HttpClient) {}
  obtenerListaParametrizaciones(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/list/`,
      datos
    );
  }
  obtenerParametro(id) {
    return this._httpClient.get<any>(
      `${environment.apiUrl}/central/param/listOne/${id}`
    );
  }
  obtenerListaPadres(tipo) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/list/tipo/todos/`,
      { tipo }
    );
  }
    obtenerListaPadresSinToken(tipo) {
        return this._httpClient.post<any>(
            `${environment.apiUrl}/central/param/list/tipo/todos/free`,
            {tipo}
        );
    }
  obtenerListaTipos() {
    return this._httpClient.get<any>(
      `${environment.apiUrl}/central/param/list/tipo/`
    );
  }
  crearParametro(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/create/`,
      datos
    );
  }
  obtenerListaHijos(nombre, tipo) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/list/filtro/nombre`,
      { tipo, nombre }
    );
  }
  eliminarParametro(id) {
    return this._httpClient.delete<any>(
      `${environment.apiUrl}/central/param/delete/${id}`
    );
  }
  actualizarParametro(datos) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/update/${datos._id}`,
      datos
    );
  }
  obtenerParametroNombreTipo(nombre, tipo) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/list/listOne`,
      { nombre, tipo }
    );
  }
  obtenerParametroTipo(tipo) {
    return this._httpClient.post<any>(
      `${environment.apiUrl}/central/param/listar/tipo/`,
      { tipo }
    );
  }
}
