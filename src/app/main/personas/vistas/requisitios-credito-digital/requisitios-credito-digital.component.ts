import {Component, OnInit, ViewChild} from '@angular/core';
import {RegistroDatosPagoProvedoresService} from '../requisito-solicitud-microcreditos/registro-datos-pago-provedores.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SolicitarCredito} from '../../models/persona';
import {User} from '../../../../auth/models';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {CreditosAutonomosService} from '../creditos-autonomos/creditos-autonomos.service';
import Decimal from 'decimal.js';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {ParametrizacionesService} from '../../servicios/parametrizaciones.service';
import {jsPDF} from 'jspdf';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

/**
 * IFIS
 * Personas
 * Esta pantalla sirve para mostrar los requisitos del credito
 * Rutas:
 * `${environment.apiUrl}/central/param/list/tipo/todos/free`,
 * `${environment.apiUrl}/central/param/list/listOne`,
 * `${environment.apiUrl}/corp/creditoPersonas/update/${datos._id}`,
 * `${environment.apiUrl}/corp/creditoPersonas/create/`,
 */

@Component({
    selector: 'app-requisitios-credito',
    templateUrl: './requisitios-credito-digital.component.html',
    styleUrls: ['./requisitios-credito-digital.component.scss']
})
export class RequisitiosCreditoDigitalComponent implements OnInit {
    @ViewChild('modalAviso') modalAviso;
    public mensaje = '';
    public plazo = 12;
    public formulario: FormGroup;
    public montoCreditoFinal;
    public valorMinimo;
    private _unsubscribeAll: Subject<any>;
    tiutlo;
    public requisitos = {
        valor: '',
        config: [],
        nombre: '',
        _id: ''
    };
    montoBASEDATOS;
    public usuario: User;
    private solicitarCredito: SolicitarCredito;
    private tipoPersona: string;
    public estadoCivil;


    constructor(
        private _coreConfigService: CoreConfigService,
        private _registroDatosService: RegistroDatosPagoProvedoresService,
        private _router: Router,
        private _coreMenuService: CoreMenuService,
        private _creditosAutonomosService: CreditosAutonomosService,
        private rutaActiva: ActivatedRoute,
        private paramService: ParametrizacionesService,
        private modalService: NgbModal,
    ) {
        this.montoCreditoFinal = +localStorage.getItem('montoCreditoFinal');
        this.usuario = this._coreMenuService.grpPersonasUser;
        const casados = ['UNIÓN LIBRE', 'CASADO'];
        if (casados.find(item => item === localStorage.getItem('estadoCivil').toUpperCase())) {
            this.estadoCivil = 'CASADO_UNION_LIBRE';
        } else {
            this.estadoCivil = 'SOLTERO_DIVORCIADO';
        }
        this.tipoPersona = `MICROCREDITO_${this.estadoCivil}`;
        this._unsubscribeAll = new Subject();
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
        this.rutaActiva.params.subscribe(
            (params: Params) => {
                this.paramService.obtenerListaPadresSinToken('REQUISITOS_MICROCREDIOS').subscribe((data) => {
                    data.map(item => {
                        if (item.nombre === 'MONTO') {
                            this.montoBASEDATOS = item.valor;
                        }
                        if (item.nombre === 'TITULO') {
                            this.tiutlo = item.valor.replace('$montoPago', this.montoBASEDATOS).replace('$cuotaMensual', params.monto);
                            console.log(this.tiutlo);
                        }
                    });
                    this.paramService.obtenerListaPadresSinToken(this.tipoPersona).subscribe((info) => {
                        info.find((item) => {
                            if (localStorage.getItem('montoCreditoFinal') < this.montoBASEDATOS) {
                                this.requisitos = info.find((item2) => {
                                    if (item2.valor === 'INFERIOR') {
                                        return item2;
                                    }
                                });
                                console.log('inferiror', this.requisitos);
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
                        console.log('requisitos', this.requisitos);
                    });
                });
                // this._registroDatosService.consultaRequisitos('REQUISITOS_MICROCREDIOS').subscribe(data => {
                //     data.map(item => {
                //         if (item.nombre === 'MONTO') {
                //             this.montoBASEDATOS = item.valor;
                //         }
                //         if (item.nombre === 'INFERIOR_INGRESOS_MENSUALES') {
                //             this.requisitosINFEROR = item.config;
                //         }
                //         if (item.nombre === 'SUPERIOR_INGRESOS_MENSUALES') {
                //             this.requisitosSUPERIOR = item.config;
                //         }
                //         if (item.nombre === 'TITULO') {
                //             this.tiutlo = item.valor.replace('$montoPago', this.montoBASEDATOS).replace('$cuotaMensual', params.monto);
                //         }
                //         if (params.monto > this.montoBASEDATOS) {
                //             this.requisitos = this.requisitosSUPERIOR;
                //         } else {
                //             this.requisitos = this.requisitosINFEROR;
                //         }
                //     });
                // });
            }
        );
        if (localStorage.getItem('credito') !== null) {
            console.log('entra if credito', JSON.parse(localStorage.getItem('grpPersonasUser')).persona.empresaInfo);
            this.solicitarCredito = JSON.parse(localStorage.getItem('credito'));
            this.solicitarCredito.tipoCredito = JSON.parse(localStorage.getItem('credito')).canal;
            this.solicitarCredito.empresaInfo = JSON.parse(localStorage.getItem('grpPersonasUser')).persona.empresaInfo;
            this.solicitarCredito.estadoCivil = JSON.parse(localStorage.getItem('grpPersonasUser')).persona.estadoCivil;
        } else {
            this.solicitarCredito = this.inicialidarSolicitudCredito();
        }
        this.formulario = new FormGroup({
            monto: new FormControl(this.montoCreditoFinal, [
                Validators.required, Validators.pattern('^([0-9])+$'), Validators.max(this.montoCreditoFinal)
            ]),
        });
    }

    ngOnInit(): void {
        this.paramService.obtenerListaPadresSinToken('VALOR_MINIMO_SOLICITAR_MICROCREDITOS_DIGITAL').subscribe((info) => {
            this.valorMinimo = info[0].valor;
            this.formulario.get('monto').setValidators([
                Validators.required, Validators.pattern('^([0-9])+$'),
                Validators.max(this.montoCreditoFinal), Validators.min(this.valorMinimo)
            ]);
            this.formulario.get('monto').updateValueAndValidity();
        });
        this.paramService.obtenerParametroNombreTipo('TIEMPO_PLAZO', 'VALORES_CALCULAR_CREDITO_CREDICOMPRA').subscribe((info) => {
            this.plazo = info.valor;
        });

        // this.usuario = this._coreMenuService.grpPersonasUser;
    }

    get Form() {
        return this.formulario.controls;
    }

    abrirModalLg(modal) {
        this.modalService.open(modal, {
            size: 'lg'
        });
    }

    inicialidarSolicitudCredito(): SolicitarCredito {
        return {
            _id: '',
            aceptaTerminos: 0,
            empresaComercial_id: '',
            empresaIfis_id: '',
            estado: 'Nuevo',
            monto: new Decimal(localStorage.getItem('montoCreditoFinal')).toNumber(),
            cuota: new Decimal(localStorage.getItem('coutaMensual')).toNumber(),
            plazo: 12,
            user_id: '',
            canal: localStorage.getItem('credito') !== null ? 'Lineas Credito Digital Pymes-PreAprobado' : 'Lineas Credito Digital Pymes-Normales',
            tipoCredito: localStorage.getItem('credito') !== null ? 'Lineas Credito Digital Pymes-PreAprobado' : 'Lineas Credito Digital Pymes-Normales',
            concepto: localStorage.getItem('credito') !== null ? 'Lineas Credito Digital Pymes-PreAprobado' : 'Lineas Credito Digital Pymes-Normales',
            nombres: '',
            apellidos: '',
            numeroIdentificacion: '',
            empresaInfo: JSON.parse(localStorage.getItem('grpPersonasUser')).persona.empresaInfo,
            estadoCivil: JSON.parse(localStorage.getItem('grpPersonasUser')).persona.estadoCivil,
            checks: [],
            cargarOrigen: 'IFIS',
            alcance: 'LOCAL',
        };
    }

    crearCredito() {
        if (this.formulario.invalid) {
            this.mensaje = 'El valor ingresado no es permitido';
            this.abrirModalLg(this.modalAviso);
            return;
        }
        this.solicitarCredito.monto = this.Form.monto.value;
        // Agregar informacion al credito
        this.solicitarCredito.user_id = this.usuario.id;
        this.solicitarCredito.nombres = this.usuario.persona.nombres;
        this.solicitarCredito.apellidos = this.usuario.persona.apellidos;
        this.solicitarCredito.numeroIdentificacion = this.usuario.persona.rucEmpresa;
        this.solicitarCredito.email = this.usuario.email;
        this.solicitarCredito.razonSocial = this.usuario.persona.empresaInfo?.comercial;
        this.solicitarCredito.rucEmpresa = this.usuario.persona.empresaInfo?.rucEmpresa;
        this.solicitarCredito.empresaInfo = this.usuario.persona.empresaInfo;
        console.log('this.usuario.persona.empresaInfo ', this.usuario.persona.empresaInfo);
        console.log('enviar credito ', this.solicitarCredito.empresaInfo);
        if (localStorage.getItem('credito') !== null) {
            this._creditosAutonomosService.actualizarCredito(this.solicitarCredito).subscribe((info) => {
                this._router.navigate(['/personas/finalizar-credito']);
            });
        } else {
            const doc = new jsPDF();

            const text = `Al autorizar el tratamiento de su información, usted acepta que la empresa Corporación OmniGlobal y todas sus marcas y/o productos a validar su información en las plataformas pertinentes.
        Al autorizar el tratamiento de su información, usted acepta que la empresa revise su información de Buró de Crédito para confirmar su estado crediticio.`;

            const x = 10;
            const y = 10;
            const maxWidth = 180; // Ancho máximo del párrafo

            doc.text(text, x, y, {maxWidth});

            // Convierte el documento en un archivo Blob
            const pdfBlob = doc.output('blob');

            // Crea un objeto FormData y agrega el archivo Blob
            const formData: FormData = new FormData();
            const creditoValores = Object.values(this.solicitarCredito);
            const creditoLlaves = Object.keys(this.solicitarCredito);

            creditoLlaves.map((llaves, index) => {
                if (creditoValores[index]) {
                    formData.delete(llaves);
                    formData.append(llaves, creditoValores[index]);
                }
            });
            formData.delete('empresaInfo');
            formData.append('empresaInfo', JSON.stringify(this.solicitarCredito.empresaInfo));
            formData.append('autorizacion', pdfBlob, 'autorizacion.pdf');
            this._creditosAutonomosService.crearCredito(formData).subscribe((info) => {
                this._router.navigate(['/personas/finalizar-credito']);
            });
        }
    }

}
