import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MicroCreditosService {

  constructor(private _httpClient: HttpClient) {
  }

  compararCodigo(data) {
    return this._httpClient.post<any>(`${environment.apiUrl}/corp/creditoPersonas/creditoPreaprobado/codigo`, data);
  }


}
