import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PagarConSuperMonedasService {

  constructor(private _httpClient: HttpClient) { }

  obtenerListaEmpresa(datos) {
    return this._httpClient.post<any>(`${environment.apiUrl}/corp/empresas/list/`, datos);
  }
  pagarConSuperMonedas(datos){
    return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagos/create/`, datos);
  }
  obtenerLongitudCodigoPago(){
    return this._httpClient.get<any>(`${environment.apiUrl}/corp/pagos/create/`);
  }
  imageUrlToBase64(urL: string) {
    return this._httpClient.get(urL, {
        observe: 'body',
        responseType: 'arraybuffer',
        headers: {'Access-Control-Allow-Origin': '*'}
      },)
      .pipe(
        take(1),
        map((arrayBuffer) =>
          btoa(
            Array.from(new Uint8Array(arrayBuffer))
            .map((b) => String.fromCharCode(b))
            .join('')
          )
        ),
      )
  }
}
