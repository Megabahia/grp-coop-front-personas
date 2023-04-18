import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SolicitudCreditosService {

    constructor(private _httpClient: HttpClient) {
    }

    actualiarEmpresa(data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/personas/personas/infoEmpresa/${data.user_id}`, data);
    }
}
