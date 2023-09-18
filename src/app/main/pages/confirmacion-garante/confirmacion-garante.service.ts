import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ConfirmacionGaranteService {
    constructor(private _httpClient: HttpClient) {
    }

    getOneCreditoPersona(data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/listOneSinAutenticar/${data._id}`, data);
    }

    updateCreditoPersona(data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/updateSinAutenticar/${data._id}`, data);
    }
}
