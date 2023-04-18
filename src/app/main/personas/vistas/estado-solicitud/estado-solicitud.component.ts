import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {AuthenticationService} from '../../../../auth/service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';

@Component({
    selector: 'app-estado-solicitud',
    templateUrl: './estado-solicitud.component.html',
    styleUrls: ['./estado-solicitud.component.scss']
})
export class EstadoSolicitudComponent implements OnInit {

    public negado = false;
    public aprobado = false;
    public pentiente = false;
    public motivo = '';
    public usuario;
    private _unsubscribeAll: Subject<any>;
    private coreConfig: any;
    private credito: any;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _authenticationService: AuthenticationService,
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
        private _coreMenuService: CoreMenuService,
    ) {
        this.usuario = this._coreMenuService.grpPersonasUser;
    }

    ngOnInit(): void {
        this._unsubscribeAll = new Subject();
        if (localStorage.getItem('estadoCredito') === 'aprobado') {
            this._coreConfigService.config
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((config) => {
                    this.coreConfig = config;
                });
            this.aprobado = true;
            this._creditosPreAprobadosService.obtenerCreditoUsuario({
                estado: 'Aprobado',
                id: this.usuario.id
            }).subscribe((info) => {
                this.credito = info;
            });
        } else if (localStorage.getItem('estadoCredito') === 'negado') {
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
            this.negado = true;
        } else {
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
            this.pentiente = true;
            this.motivo = localStorage.getItem('motivo');
        }
    }

    cerrarSesion() {
        localStorage.clear();
    }
}
