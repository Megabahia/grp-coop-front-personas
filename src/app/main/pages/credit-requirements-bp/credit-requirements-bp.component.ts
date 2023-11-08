import {Component, OnInit} from '@angular/core';
import Decimal from 'decimal.js';
import {ParametrizacionesService} from '../../personas/servicios/parametrizaciones.service';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {Router} from '@angular/router';

/**
 * COOP
 * PErsonas
 * ESta pantalla sirve para informar los paso de la solicitud de credito
 * Rutas:
 * No tiene llamada a rutas
 */

@Component({
    selector: 'app-credit-requirements-bp',
    templateUrl: './credit-requirements-bp.component.html',
    styleUrls: ['./credit-requirements-bp.component.scss']
})
export class CreditRequirementsBpComponent implements OnInit {

    public coutaMensual;
    public montoCreditoFinal;
    public requisitos = {
        valor: '',
        config: [],
        nombre: '',
        _id: ''
    };
    public descripcion = {
        valor: '',
        config: [],
        nombre: '',
        _id: ''
    };
    public tipoPersona;


    constructor(
        private _router: Router,
        private _coreConfigService: CoreConfigService,
        private paramService: ParametrizacionesService,
    ) {
        if (localStorage.getItem('pagina') !== 'https://credicompra.com/') {
            this._router.navigate([
                `/grp/login`,
            ]);
            localStorage.clear();
            return;
        }
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

        this.coutaMensual = localStorage.getItem('coutaMensual');
        this.montoCreditoFinal = localStorage.getItem('montoCreditoFinal');
        const casados = ['UNIÓN LIBRE', 'CASADO'];
        let tipoPersona;
        let estadoCivil;
        if (localStorage.getItem('tipoPersona') === 'Empleado') {
            tipoPersona = 'EMPLEADO';
        } else {
            tipoPersona = 'NEGOCIOS';
        }
        if (casados.find(item => item === localStorage.getItem('estadoCivil').toUpperCase())) {
            estadoCivil = 'CASADO';
        } else {
            estadoCivil = 'SOLTERO';
        }
        this.tipoPersona = `REQUISITOS_${tipoPersona}_${estadoCivil}_CREDICOMPRA`;
        this.getInfo();
    }

    ngOnInit(): void {
    }

    getInfo() {
        this.paramService.obtenerListaPadresSinToken(this.tipoPersona).subscribe((info) => {
            this.requisitos = info[0];
            // this.requisitos.config = this.requisitos.config.slice(1, -1).toString().split(',').map(item => {
            //     return item.replace(/'/g, '');
            // });
        });
        this.paramService.obtenerListaPadresSinToken('DESCRIPCION_REQUISITOS_CREDICOMPRA').subscribe((info) => {
            this.descripcion = info[0];
            this.descripcion.valor = this.descripcion.valor.replace('${{montoCreditoFinal}}', this.montoCreditoFinal);
            this.descripcion.valor = this.descripcion.valor.replace('${{coutaMensual}}', this.coutaMensual);
        });
    }

    simulador() {
        localStorage.setItem('simulador', 'ok');
    }

    cancelar() {
        localStorage.clear();
    }

}
