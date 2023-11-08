import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {ParametrizacionesService} from '../../../personas/servicios/parametrizaciones.service';

/**
 * coop
 * PErsonas
 * Esta pantalla sirve para mostrar los requisitos del credito
 * Rutas:
 * `${environment.apiUrl}/central/param/list/tipo/todos/free`,
 */

@Component({
    selector: 'app-requisitos',
    templateUrl: './requisitos.component.html',
    styleUrls: ['./requisitos.component.scss']
})
export class RequisitosComponent implements OnInit {

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
        } else if (localStorage.getItem('tipoPersona') === 'Negocio propio') {
            tipoPersona = 'NEGOCIOS';
        } else {
            tipoPersona = 'ALFA';
        }
        if (casados.find(item => item === localStorage.getItem('estadoCivil').toUpperCase())) {
            estadoCivil = 'CASADO';
        } else {
            estadoCivil = 'SOLTERO';
        }
        this.tipoPersona = `CREDITO_AUTOMOTRIZ_DIGITAL_REQUISITOS_${tipoPersona}_${estadoCivil}_CREDICOMPRA`;
        this.getInfo();
    }

    ngOnInit(): void {
    }

    getInfo() {
        this.paramService.obtenerListaPadresSinToken(this.tipoPersona).subscribe((info) => {
            this.requisitos = info[0];
        });
        this.paramService.obtenerListaPadresSinToken('CREDITO_AUTOMOTRIZ_DIGITAL_DESCRIPCION_REQUISITOS').subscribe((info) => {
            this.descripcion = info[0];
            this.descripcion.valor = this.descripcion.valor.replace('${{montoCreditoFinal}}', this.montoCreditoFinal);
            this.descripcion.valor = this.descripcion.valor.replace('${{coutaMensual}}', this.coutaMensual);
        });
    }

    simulador() {
        localStorage.setItem('simulador', 'credito-automotriz-digital');
    }

    cancelar() {
        localStorage.clear();
    }

}
