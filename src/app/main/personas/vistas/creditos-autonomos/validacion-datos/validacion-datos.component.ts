import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreConfigService} from '../../../../../../@core/services/config.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

/**
 * COOP
 * PErsonas
 * ESta pantalla sirve para mostrar la validacion de los datos del credito
 * Rutas:
 * No tiene llamado a rutas
 */

@Component({
    selector: 'app-validacion-datos',
    templateUrl: './validacion-datos.component.html',
    styleUrls: ['./validacion-datos.component.scss']
})
export class ValidacionDatosComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    public coreConfig: any;

    constructor(
        private _coreConfigService: CoreConfigService,
    ) {
        this._unsubscribeAll = new Subject();
        // Subscribe to config changes
        this._coreConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                // config.app.appLogoImage = 'assets/images/logo/credicompra.png';
                this.coreConfig = config;
            });
    }

    ngOnInit(): void {
        this._coreConfigService.config = {
            layout: {
                navbar: {
                    hidden: true,
                },
                footer: {
                    hidden: true,
                },
                menu: {
                    hidden: true,
                },
                customizer: false,
                enableLocalStorage: false,
            },
        };
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
