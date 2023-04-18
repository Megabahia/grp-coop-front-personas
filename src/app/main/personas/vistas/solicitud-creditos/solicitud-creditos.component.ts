import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../../auth/models';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {SolicitudCreditosService} from './solicitud-creditos.service';
import {Router} from '@angular/router';
import {ParametrizacionesService} from '../../servicios/parametrizaciones.service';
import {takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {Subject} from 'rxjs';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import Decimal from 'decimal.js';

@Component({
    selector: 'app-solicitud-creditos',
    templateUrl: './solicitud-creditos.component.html',
    styleUrls: ['./solicitud-creditos.component.scss']
})
export class SolicitudCreditosComponent implements OnInit {
    // configuracion
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;

    @ViewChild('teams') teams!: ElementRef;
    public formSolicitud: FormGroup;
    public formConyuge: FormGroup;
    public estadoCivil;
    public casado = false;
    public submitted = false;
    public usuario: User;
    public paisOpciones;
    public provinciaOpciones;
    public ciudadOpciones;
    public tipoParentesco = [];
    public listadoEstadoCivil;
    public porcentajeConyuge = 2;
    public porcentajeCapacidaPago = 0.80;
    public tasaInteres = 17;
    public tasaInteresMensual = 0.0;
    public plazo = 12;
    public montoMaximo = 2500;
    public montoMinimo = 500;
    private estadoCivilStorage;
    private tipoPersonaStorage;
    private montoCreditoFinalStorage: string;
    private coutaMensualStorage;
    private montoInteresStorage;

    constructor(
        private _coreConfigService: CoreConfigService,
        private paramService: ParametrizacionesService,
        private _formBuilder: FormBuilder,
        private _coreMenuService: CoreMenuService,
        private _serviceUpdateEmpresa: SolicitudCreditosService,
        private _router: Router
    ) {
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
    }

    ngOnInit(): void {
        this.valoresLocalStorage();
        this.paramService.obtenerListaPadresSinToken('VALORES_CALCULAR_CREDITO_CREDICOMPRA').subscribe((info) => {
            info.map(item => {
                if (item.nombre === 'PORCENTAJE_CONYUGE') {
                    this.porcentajeConyuge = new Decimal(item.valor).toNumber();
                }
                if (item.nombre === 'PORCENTAJE_CAPACIDAD_PAGO') {
                    this.porcentajeCapacidaPago = new Decimal(item.valor).div(100).toNumber();
                }
                if (item.nombre === 'TIEMPO_PLAZO') {
                    this.plazo = item.valor;
                }
                if (item.nombre === 'TASA_INTERES') {
                    this.tasaInteres = new Decimal(item.valor).toDecimalPlaces(2).toNumber();
                    this.tasaInteresMensual = new Decimal(item.valor).div(this.plazo).toDecimalPlaces(2).toNumber();
                }
                if (item.nombre === 'MONTO_MAXIMO') {
                    this.montoMaximo = item.valor;
                }
                if (item.nombre === 'MONTO_MINIMO') {
                    this.montoMinimo = item.valor;
                }
            });
        });
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.declareFormConyuge();
        this.formSolicitud = this._formBuilder.group(
            {
                reprsentante: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                rucEmpresa: ['', [Validators.required, Validators.minLength(13),
                    Validators.maxLength(13), Validators.pattern('^[0-9]+001$'), ValidacionesPropias.rucValido]], //
                comercial: ['', [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                actividadEconomica: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                pais: ['', Validators.required],
                provincia: ['', Validators.required],
                ciudad: ['', Validators.required],
                callePrincipal: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                calleSecundaria: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                refenciaNegocio: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                direccionDomiciolRepresentante: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                esatdo_civil: ['', [Validators.required]], //
                correo: [this.usuario.email, [Validators.required, Validators.email]], //
                telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                celular: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                whatsapp: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                conyuge: this._formBuilder.group({
                    nombreConyuge: [''], //
                    telefonoConyuge: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]], //
                    cedulaConyuge: [''],
                }),
                familiares: this._formBuilder.array([
                    this._formBuilder.group({
                        tipoPariente: ['', [Validators.required]],
                        nombreFamiliar: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                        apellidoFamiliar: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                        telefonoFamiliar: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                        direccionFamiliar: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                        //
                    }),
                    this._formBuilder.group({
                        tipoPariente: ['', [Validators.required]],
                        nombreFamiliar: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                        apellidoFamiliar: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                        telefonoFamiliar: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                        direccionFamiliar: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                        //
                    }),
                    this._formBuilder.group({
                        tipoPariente: ['', [Validators.required]],
                        nombreFamiliar: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                        apellidoFamiliar: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]], //
                        telefonoFamiliar: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                        direccionFamiliar: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]], //
                        //
                    }),
                ], [ValidacionesPropias.parientesTelefonos, ValidacionesPropias.padres]),
                comerciales: this._formBuilder.array([
                    this._formBuilder.group({
                        nombresDuenoComercial: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                        negocioDuenoComercial: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                        telefonoDuenoComercial: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                        direccionDuenoComercial: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]],
                    }),
                    this._formBuilder.group({
                        nombresDuenoComercial: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                        negocioDuenoComercial: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                        telefonoDuenoComercial: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                        direccionDuenoComercial: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]],
                    }),
                    this._formBuilder.group({
                        nombresDuenoComercial: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                        negocioDuenoComercial: ['', [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                        telefonoDuenoComercial: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
                        direccionDuenoComercial: ['', [Validators.required, Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]],
                    }),
                ], [ValidacionesPropias.comercialesTelefonos]),
                inresosMensualesVentas: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], //
                sueldoConyuge: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], //
                otrosIngresos: ['', [Validators.pattern('^[0-9]*$')]], //
                gastosMensuales: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], //
                gastosFamilaires: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], //
                especificaIngresos: [''], //
                otrosGastos: ['', [Validators.pattern('^[0-9]*$')]], //
                especificaGastos: [''], //
                totalIngresos: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], //
                totalEgresos: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], //
            });
        console.log('estado civil', this.usuario.persona.empresaInfo.esatdo_civil);
        if (this.usuario.persona.empresaInfo) {
            this.formSolicitud.patchValue({...this.usuario.persona.empresaInfo});
            if (this.usuario.persona.empresaInfo.esatdo_civil === 'Casado' || this.usuario.persona.empresaInfo.esatdo_civil === 'Unión libre') {
                this.casado = true;
            }
        }
        if (localStorage.getItem('credito')) {
            const credito = JSON.parse(localStorage.getItem('credito'));
            this.formSolicitud.get('reprsentante').setValue(credito.empresaInfo.reprsentante);
            this.formSolicitud.get('rucEmpresa').setValue(credito.empresaInfo.rucEmpresa);
            this.formSolicitud.get('comercial').setValue(credito.empresaInfo.comercial);
            this.formSolicitud.get('esatdo_civil').setValue(credito.empresaInfo.esatdo_civil);
            this.formSolicitud.get('celular').setValue(credito.empresaInfo.celular);
            if (credito.empresaInfo.esatdo_civil === 'Casado' || credito.empresaInfo.esatdo_civil === 'Unión libre') {
                this.casado = true;
            }
        }
        this.obtenerPaisOpciones();
        this.obtenerProvinciaOpciones();
        this.obtenerCiudadOpciones();
        this.obtenerEstadosCiviles();
        this.paramService.obtenerListaPadres('TIPO_PARIENTE').subscribe((info) => {
            this.tipoParentesco = info;
        });
    }

    declareFormConyuge() {
        this.formConyuge = this._formBuilder.group({
            nombreConyuge: [''], //
            telefonoConyuge: [''], //
            correoConyuge: [''],
        });
    }

    selectEstadoCivil() {
        this.casado = false;
        this.estadoCivil = this.teams.nativeElement.value;
        this.declareFormConyuge();
        console.log(this.formSolicitud.get('esatdo_civil').value);
        if (this.formSolicitud.get('esatdo_civil').value === 'Casado' || this.formSolicitud.get('esatdo_civil').value === 'Unión libre') {
            // (this.formSolicitud.get('conyuge') as FormGroup)
            //     .addControl('nombreConyuge', new FormControl('', Validators.required));
            // .setControl('nombreConyuge', new FormControl('', Validators.required));
            (this.formSolicitud as FormGroup).setControl('conyuge', this._formBuilder.group({
                nombreConyuge: ['', [Validators.required]],
                telefonoConyuge: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]], //
                cedulaConyuge: ['', [Validators.required]],
            }));
            console.log('control conyuge', this.formSolicitud.get('conyuge')['controls']);
            this.casado = true;
            (this.formSolicitud as FormGroup).setControl('sueldoConyuge',
                new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]));
        } else {
            (this.formSolicitud as FormGroup).setControl('conyuge', this._formBuilder.group({
                nombreConyuge: ['',],
                telefonoConyuge: ['',],
                cedulaConyuge: ['',]
            }));
            this.formSolicitud.controls['sueldoConyuge'].setValue(0);
        }
    }

    valoresLocalStorage() {
        this.estadoCivilStorage = localStorage.getItem('estadoCivil');
        console.log(this.estadoCivilStorage);
        if (this.estadoCivilStorage === 'Casado' || this.estadoCivilStorage === 'Unión libre') {
            this.casado = true;

        } else {
            console.log('else');
            this.casado = false;
        }
        this.tipoPersonaStorage = localStorage.getItem('tipoPersona');
        this.montoCreditoFinalStorage = localStorage.getItem('montoCreditoFinal');
        this.coutaMensualStorage = localStorage.getItem('coutaMensual');
        this.montoInteresStorage = localStorage.getItem('montoInteres');
    }

    obtenerPaisOpciones() {
        this.paramService.obtenerListaPadres('PAIS').subscribe((info) => {
            this.paisOpciones = info;
        });
    }

    obtenerProvinciaOpciones() {
        this.paramService.obtenerListaHijos(this.formSolicitud.get('pais').value, 'PAIS').subscribe((info) => {
            this.provinciaOpciones = info;
        });
    }

    obtenerCiudadOpciones() {
        this.paramService.obtenerListaHijos(this.formSolicitud.get('provincia').value, 'PROVINCIA').subscribe((info) => {
            this.ciudadOpciones = info;
        });
    }

    obtenerEstadosCiviles() {
        this.paramService.obtenerListaPadresSinToken('ESTADO_CIVIL').subscribe((info) => {
            this.listadoEstadoCivil = info;
        });
    }

    get controlsFrom() {
        return this.formSolicitud.controls;
    }

    get controlsFromContuge() {
        return this.formConyuge.controls;
    }

    get controlsContuge() {
        return this.formSolicitud.get('conyuge')['controls'];
    }

    calcularCredito() {
        const ingresosTotal = new Decimal(this.formSolicitud.get('totalIngresos').value).toNumber()
            || 0;
        const gastosTotal = new Decimal(this.formSolicitud.get('totalEgresos').value).toNumber() || 0;
        // Formula para el calculo interes
        const ingresosConyuge = new Decimal((new Decimal(this.formSolicitud.get('sueldoConyuge').value).toNumber() || 0) / 2);
        const ingresosMensuales = new Decimal(ingresosTotal).sub(ingresosConyuge);
        const gastosMensuales = new Decimal(gastosTotal);
        const ingresoDisponible = ingresosMensuales.add(ingresosConyuge).sub(gastosMensuales).toDecimalPlaces(2).toNumber();
        // if (ingresoDisponible === 0) {
        //     this.mensaje = '¡Lo sentimos! Con los datos ingresados lamentamos informarte que no cuentas con capacidad de pago.';
        //     this.abrirModalLg(this.modalAviso);
        //     return;
        // }
        const capacidadPago = new Decimal(ingresoDisponible).mul(this.porcentajeCapacidaPago).floor().toNumber();

        const montoInteresMensual = new Decimal(capacidadPago).mul((this.tasaInteres / 100)).toDecimalPlaces(2).toNumber();

        let cuotaMensual = new Decimal(capacidadPago).add(montoInteresMensual).toDecimalPlaces(2).toNumber();

        const montoCredito = new Decimal(cuotaMensual).mul(12).toNumber();

        // if (montoCredito === 0) {
        //     this.mensaje = '¡Lo sentimos! Con los datos ingresados lamentamos informarte que no cuentas con capacidad de pago.';
        //     this.abrirModalLg(this.modalAviso);
        //     return false;
        // }
        const resto = new Decimal(montoCredito.toString().substr(2, 4) || 0);
        const montoCreditoRedondeado = new Decimal(montoCredito).sub(resto).toNumber();
        let montoCreditoFinal = 0;
        // if (montoCreditoRedondeado < this.montoMinimo) {
        //     this.mensaje = '¡Lo sentimos! Con los datos ingresados lamentamos informarte que no cuentas con capacidad de pago.';
        //     this.abrirModalLg(this.modalAviso);
        //     return false;
        // } else
        if (montoCreditoRedondeado >= this.montoMaximo) {
            montoCreditoFinal = this.montoMaximo;
            cuotaMensual = new Decimal(this.montoMaximo / 12).toDecimalPlaces(2).toNumber();
        } else {
            montoCreditoFinal = montoCreditoRedondeado;
        }

        localStorage.setItem('montoInteres', this.tasaInteres.toString());
        localStorage.setItem('coutaMensual', cuotaMensual.toString());
        localStorage.setItem('montoCreditoFinal', montoCreditoFinal.toString());
        return true;
    }

    guardar() {
        this.submitted = true;
        if (this.formSolicitud.invalid) {
            console.log('fomulario', this.formSolicitud);
            return;
        }
        // this.formSolicitud.setValue('conyuge', this.formConyuge.value);
        const values = {
            empresaInfo: this.formSolicitud.value,
            user_id: this.usuario.id,
        };
        this.calcularCredito();

        this._serviceUpdateEmpresa.actualiarEmpresa(values).subscribe((valor) => {
            console.log('guardado', valor);
            const newJson = JSON.parse(localStorage.getItem('grpPersonasUser'));
            newJson.persona.empresaInfo = values.empresaInfo;
            localStorage.setItem('grpPersonasUser', JSON.stringify(newJson));
            this._router.navigate([`/personas/requisitosCredito/${localStorage.getItem('montoCreditoFinal')}`]);
        });
        console.log('values', this.formSolicitud.value, values);
        // this._perfilUsuarioService
        //     .guardarInformacion(values)
        //     .subscribe(
        //         (info) => {
        //             // if (info.error) {
        //             //     return;
        //             // }
        //             // const newJson = JSON.parse(localStorage.getItem('grpPersonasUser'));
        //             // newJson.empresaInfo = values.empresaInfo;
        //             // localStorage.setItem('grpPersonasUser', JSON.stringify(newJson));
        //         });
    }

    totalIngresos() {
        const inresosMensualesVentas = new Decimal(this.formSolicitud.get('inresosMensualesVentas').value || 0);
        const sueldoConyuge = new Decimal(this.formSolicitud.get('sueldoConyuge').value || 0);
        const otrosIngresos = new Decimal(this.formSolicitud.get('otrosIngresos').value || 0);
        this.formSolicitud.controls['totalIngresos'].setValue(inresosMensualesVentas.add(sueldoConyuge).add(otrosIngresos));
    }

    totalEgresos() {
        const gastosMensuales = new Decimal(this.formSolicitud.get('gastosMensuales').value || 0);
        const gastosFamilaires = new Decimal(this.formSolicitud.get('gastosFamilaires').value || 0);
        const otrosGastos = new Decimal(this.formSolicitud.get('otrosGastos').value || 0);
        this.formSolicitud.controls['totalEgresos'].setValue(gastosMensuales.add(gastosFamilaires).add(otrosGastos));
    }

    get conyuges() {
        return this.formSolicitud.controls['conyuges'] as FormArray;
    }

    get familiares() {
        return this.formSolicitud.controls['familiares'] as FormArray;
    }

    agregarFamiliar() {
        const cuentaForm = this._formBuilder.group({
            nombreFamiliar: [''], //
            apellidoFamiliar: [''], //
            telefonoFamiliar: [''], //
            direccionFamiliar: [''],
        });
        this.familiares.push(cuentaForm);
    }

    comprobarOtrosIngresos(event) {
        if (event.target.value > 0) {
            console.log('validar');
            (this.formSolicitud as FormGroup).setControl('especificaIngresos',
                new FormControl(this.formSolicitud.value?.especificaIngresos, [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]));
        } else {
            (this.formSolicitud as FormGroup).setControl('especificaIngresos',
                new FormControl(this.formSolicitud.value?.especificaIngresos));
        }
    }

    comprobarOtrosGastos(event) {
        if (event.target.value > 0) {
            console.log('validar');
            (this.formSolicitud as FormGroup).setControl('especificaGastos',
                new FormControl(this.formSolicitud.value?.especificaGastos, [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]));
        } else {
            (this.formSolicitud as FormGroup).setControl('especificaGastos',
                new FormControl(this.formSolicitud.value?.especificaGastos));
        }
    }

}
