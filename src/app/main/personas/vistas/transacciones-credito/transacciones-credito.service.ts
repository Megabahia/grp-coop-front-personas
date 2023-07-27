import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransaccionesCreditoService {

    constructor(private _httpClient: HttpClient) {
    }

    obtenerListaMovimientos(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/movimientoCobros/list/transacciones`, datos);
    }
}
