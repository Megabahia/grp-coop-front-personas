import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RegistroProveedorService {

    constructor(private _httpClient: HttpClient) {
    }

    getOne(data) {
        return this._httpClient.get<any>(`${environment.apiUrl}/personas/proveedores/listOne/${data}`);
    }

    create(data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/personas/proveedores/create/`, data);
    }

    update(id, data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/personas/proveedores/update/${id}`, data);
    }

    list(data) {
        return this._httpClient.post<any>(`${environment.apiUrl}/personas/proveedores/list/`, data);
    }

    delete(id) {
        return this._httpClient.delete<any>(`${environment.apiUrl}/personas/proveedores/delete/${id}`);
    }
}
