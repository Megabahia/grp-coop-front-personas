import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PreArpovedCreditLineService {
    constructor(private _httpClient: HttpClient) {
    }

    validateCredit(data) {
        return this._httpClient.post<any>(
            `${environment.apiUrl}/corp/creditoPersonas/creditoPreaprobado/codigo`,
            data
        );
    }
}
