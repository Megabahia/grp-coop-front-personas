import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PagoEmpleadosService {
    constructor(
        private _httpClient: HttpClient
    ) {
    }

    listarPagoEmpleados(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagoEmpleados/list/`, datos);
    }

    actualizarPagoEmpleados(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagoEmpleados/update/${datos._id}`, datos);
    }

    firmarPagoEmpleados(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagoEmpleados/update/${datos.get('_id')}`, datos);
    }

    subirArchivoPagoEmpleados(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/pagoEmpleados/upload/`, datos);
    }
}
