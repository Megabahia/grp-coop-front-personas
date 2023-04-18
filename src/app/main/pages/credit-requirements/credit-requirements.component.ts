import {Component, OnDestroy, OnInit} from '@angular/core';
import Decimal from 'decimal.js';
import {ParametrizacionesService} from '../../personas/servicios/parametrizaciones.service';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-credit-requirements',
    templateUrl: './credit-requirements.component.html',
    styleUrls: ['./credit-requirements.component.scss']
})
export class CreditRequirementsComponent implements OnInit, OnDestroy {

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

    public coreConfig: any;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _router: Router,
        private _coreConfigService: CoreConfigService,
        private paramService: ParametrizacionesService,
    ) {
        this._unsubscribeAll = new Subject();
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
            estadoCivil = 'CASADO_UNION_LIBRE';
        } else {
            estadoCivil = 'SOLTERO_DIVORCIADO';
        }
        // this.tipoPersona = `REQUISITOS_${tipoPersona}_${estadoCivil}_CREDICOMPRA`;
        this.tipoPersona = `MICROCREDITO_${estadoCivil}`;
        this.getInfo();
    }

    ngOnInit(): void {
        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    getInfo() {
        this.paramService.obtenerParametroNombreTipo('MONTO', 'REQUISITOS_MICROCREDIOS').subscribe((data) => {
            this.paramService.obtenerListaPadresSinToken(this.tipoPersona).subscribe((info) => {
                info.find((item) => {
                    if (data.valor > this.montoCreditoFinal) {
                        this.requisitos = info.find((item2) => {
                            if (item2.valor === 'INFERIOR') {
                                return item2;
                            }
                        });
                        console.log('inferior', this.requisitos);
                    } else {
                        this.requisitos = info.find((item2) => {
                            if (item2.valor === 'SUPERIROR') {
                                return item2;
                            }
                        });
                        console.log('superior', this.requisitos);
                    }
                    return item;
                });
            });
        });
        this.paramService.obtenerListaPadresSinToken('DESCRIPCION_REQUISITOS_CREDICOMPRA').subscribe((info) => {
            this.descripcion = info[0];
            this.descripcion.valor = this.descripcion.valor.replace('${{montoCreditoFinal}}', this.montoCreditoFinal);
            this.descripcion.valor = this.descripcion.valor.replace('${{coutaMensual}}', this.coutaMensual);
            this.paramService.obtenerListaPadresSinToken('VALORES_CALCULAR_CREDITO_CREDICOMPRA').subscribe((info2) => {
                info2.map(item => {
                    if (item.nombre === 'TIEMPO_PLAZO') {
                        this.descripcion.valor = this.descripcion.valor.replace('${{tiempoPlazo}}', item.valor);
                    }
                });
            });
        });
    }

    simulador() {
        console.log('entro');
        localStorage.setItem('simulador', 'ok');
        this._router.navigate([
            `/personas/solucitudCredito`,
        ]);
    }

    cancelar() {
        localStorage.clear();
    }

}
