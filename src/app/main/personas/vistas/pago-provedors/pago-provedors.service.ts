import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PagoProvedorsService {
    constructor(
        private _httpClient: HttpClient
    ) {
    }

    crearSolicitudPagoProveedor(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagoProveedores/create/`, datos);
    }

    actualizarCredito(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagoProveedores/update/${datos.get('_id')}`, datos);
    }
}
