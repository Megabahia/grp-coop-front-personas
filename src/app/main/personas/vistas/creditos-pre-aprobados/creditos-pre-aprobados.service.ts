import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CreditosPreAprobadosService {

    constructor(private _httpClient: HttpClient) {
    }

    obtenerCreditoUsuario(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/listOne/usuario/${datos.id}`, datos);
    }

    obtenerListaCreditos(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/list/`, datos);
    }

    obtenerListaConvenios(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/empresas/list/convenio/`, datos);
    }

    obtenerListaEmpresasArray(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/empresas/list/empresas/array/`, datos);
    }

    actualizarCredito(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/update/${datos.get('_id')}`, datos);
    }

    verificarPropietarioFirma(datos) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/verificarPropietarioFirma`, datos);
    }
}
