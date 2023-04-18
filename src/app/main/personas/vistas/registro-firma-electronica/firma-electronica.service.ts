import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirmaElectronicaService {

    constructor(private _httpClient: HttpClient) {
    }

    crear(data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/corp/firmaElectronica/create/`, data);
    }
}
