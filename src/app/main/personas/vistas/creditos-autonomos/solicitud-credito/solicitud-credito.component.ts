import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {CoreConfigService} from '../../../../../../@core/services/config.service';
import {ParametrizacionesService} from '../../../servicios/parametrizaciones.service';
import moment from 'moment';
import {CoreMenuService} from '../../../../../../@core/components/core-menu/core-menu.service';
import {CreditosAutonomosService} from '../creditos-autonomos.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import Decimal from 'decimal.js';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ValidacionesPropias} from '../../../../../../utils/customer.validators';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-solicitud-credito',
    templateUrl: './solicitud-credito.component.html',
    styleUrls: ['./solicitud-credito.component.scss']
})
export class SolicitudCreditoComponent implements OnInit {
    @Output() estado = new EventEmitter<number>();
    @ViewChild('modalAviso') modalAviso;

    public coreConfig: any;
    public usuario;
    public user_id;
    public personaForm: FormGroup;
    public tipoNivelInstrucciones = [];
    public tipoViviendas = [];
    public tipoPersona = [];
    public tipoParentesco = [];
    public fecha;
    public tipoIdentificacion = [];
    public menorEdad = false;
    private _unsubscribeAll: Subject<any>;
    public nombreDueno = false;
    public casado = false;
    public submittedPersona = false;
    public estadoCivilOptions = [];
    public estadoCivilStorage;
    public tipoPersonaStorage;
    public montoCreditoFinalStorage;
    public coutaMensualStorage;
    public montoInteresStorage;
    public generos = [];
    public mensaje;


    public porcentajeConyuge = 2;
    public porcentajeCapacidaPago = 0.80;
    public tasaInteres = 17;
    public tasaInteresMensual = 0.0;
    public plazo = 12;
    public montoMaximo = 2500;
    public montoMinimo = 500;


    public startDateOptions: FlatpickrOptions = {
        defaultDate: 'today',
        altInput: true,
        mode: 'single',
        altFormat: 'Y-n-j',
        altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    };
    public paises;
    public provincias;
    public ciudades;
    public paisEmpresa;
    public provinciaEmpresa;
    public ciudadEmpresa;
    public paisReferido1;
    public provinciaReferido1;
    public ciudadReferido1;
    public paisReferido2;
    public provinciaReferido2;
    public ciudadReferido2;
    public paisReferido3;
    public provinciaReferido3;
    public ciudadReferido3;
    public paisTipoPersonaOpciones;
    public provinciaTipoPersonaOpciones;
    public ciudadTipoPersonaOpciones;
    public garanteNegocio = false;
    public alfa = false;

    constructor(
        private _creditosAutonomosService: CreditosAutonomosService,
        private paramService: ParametrizacionesService,
        private _coreMenuService: CoreMenuService,
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
    ) {
        this._unsubscribeAll = new Subject();
        this.usuario = this._coreMenuService.grpPersonasUser.persona;
        this.user_id = this._coreMenuService.grpPersonasUser.id;
        this._creditosAutonomosService.obtenerInformacion(this.user_id).subscribe((info) => {
            const grpPersonasUser = JSON.parse(localStorage.getItem('grpPersonasUser'));
            grpPersonasUser.persona = info;
            localStorage.setItem('grpPersonasUser', JSON.stringify(grpPersonasUser));

        });
        this.obtenerListas();
    }

    get persForm() {
        return this.personaForm.controls;
    }

    get ocuSolicitanteForm() {
        return this.personaForm.get('ocupacionSolicitante')['controls'];
    }

    get refeSolicitanteForm() {
        return this.personaForm.controls['referenciasSolicitante'] as FormArray;
    }

    get ingreSolicitanteForm() {
        return this.personaForm.get('ingresosSolicitante')['controls'];
    }

    get gasSolicitanteForm() {
        return this.personaForm.get('gastosSolicitante')['controls'];
    }

    get garanteForm() {
        return this.personaForm.get('garante')['controls'];
    }

    ngOnInit(): void {
        this.valoresLocalStorage();
        const fechaSolicitud = moment().format('L');
        this.usuario.whatsapp = this.usuario.whatsapp.replace('+593', '0');
        console.log('TIPO_PERSONA', this.tipoPersonaStorage);
        this.personaForm = this._formBuilder.group({
                tipoIdentificacion: [this.usuario.tipoIdentificacion, [Validators.required]],
                tipoPersona: [this.tipoPersonaStorage, [Validators.required]],
                documento: [this.usuario.identificacion, Validators.required],
                email: [this.usuario.email],
                whatsapp: [this.usuario?.whatsapp, [Validators.required,
                    Validators.maxLength(10),
                    Validators.minLength(10),
                    Validators.pattern('^[0-9]*$')]],
                celular: [this.usuario.celular, [Validators.required,
                    Validators.maxLength(10),
                    Validators.minLength(10),
                    Validators.pattern('^[0-9]*$')]],
                genero: [this.usuario.genero, Validators.required],
                edad: [this.usuario.edad],
                fechaSolicitud: [fechaSolicitud, Validators.required],
                nombres: [this.usuario.nombres, [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ]+\\s[a-zA-ZñÑáéíóúÁÉÍÓÚ]*')]],
                apellidos: [this.usuario.apellidos, [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ]+\\s[a-zA-ZñÑáéíóúÁÉÍÓÚ]*')]],
                fechaNacimiento: [this.usuario.fechaNacimiento, [Validators.required]],
                nivelInstruccion: [this.usuario.nivelInstruccion, Validators.required],
                tipoVivienda: [this.usuario.tipoVivienda, Validators.required],
                nombreDueno: [this.usuario.nombreDueno, [Validators.minLength(8), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\\s]+')]],
                whatsappDueno: ['', []],
                pais: [this.usuario.pais, Validators.required],
                provincia: [this.usuario.provincia, Validators.required],
                ciudad: [this.usuario.ciudad, Validators.required],
                direccionDomicilio: [this.usuario.direccionDomicilio, [Validators.required, Validators.minLength(20), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\\s]+')]],
                referenciaDomicilio: [this.usuario.referenciaDomicilio, Validators.required],
                estadoCivil: [this.estadoCivilStorage, Validators.required],
                ocupacionSolicitante: this._formBuilder.group({
                    nombreNegocio: [this.usuario.ocupacionSolicitante?.nombreNegocio, [
                        Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                    ],
                    direccionNegocio: [this.usuario.ocupacionSolicitante?.direccionNegocio, [
                        Validators.required, Validators.minLength(20), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\\s]+')
                    ]],
                    tiempoTrabajo: [this.usuario.ocupacionSolicitante?.tiempoTrabajo, [
                        Validators.required, Validators.pattern('^([0-9])+$')]
                    ],
                    cargoDesempeno: [this.usuario.ocupacionSolicitante?.cargoDesempeno, [
                        Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                    ],
                    // sueldoPercibe: ['', [Validators.required, Validators.pattern('^([0-9])+$')]],
                }),
                referenciasSolicitante: this._formBuilder.array([
                    this._formBuilder.group({
                        referenciaSolicitante: [this.usuario.referenciasSolicitante[0]?.referenciaSolicitante, [Validators.required]],
                        nombre: [this.usuario.referenciasSolicitante[0]?.nombre, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                        ],
                        apellido: [this.usuario.referenciasSolicitante[0]?.apellido, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                        ],
                        direccion: [this.usuario.referenciasSolicitante[0]?.direccion, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\\s]+')]
                        ],
                        telefono: [this.usuario.referenciasSolicitante[0]?.telefono, [Validators.required,
                            Validators.maxLength(10),
                            Validators.minLength(10),
                            Validators.pattern('^[0-9]*$')]],
                        pais: [this.usuario.referenciasSolicitante[0]?.pais, [Validators.required]],
                        provincia: [this.usuario.referenciasSolicitante[0]?.provincia, [Validators.required]],
                        ciudad: [this.usuario.referenciasSolicitante[0]?.ciudad, [Validators.required]],
                    }),
                    this._formBuilder.group({
                        referenciaSolicitante: [this.usuario.referenciasSolicitante[1]?.referenciaSolicitante, [Validators.required]],
                        nombre: [this.usuario.referenciasSolicitante[1]?.nombre, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                        ],
                        apellido: [this.usuario.referenciasSolicitante[1]?.apellido, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                        ],
                        direccion: [this.usuario.referenciasSolicitante[1]?.direccion, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\\s]+')]
                        ],
                        telefono: [this.usuario.referenciasSolicitante[1]?.telefono, [Validators.required,
                            Validators.maxLength(10),
                            Validators.minLength(10),
                            Validators.pattern('^[0-9]*$')]],
                        pais: [this.usuario.referenciasSolicitante[1]?.pais, [Validators.required]],
                        provincia: [this.usuario.referenciasSolicitante[1]?.provincia, [Validators.required]],
                        ciudad: [this.usuario.referenciasSolicitante[1]?.ciudad, [Validators.required]],
                    }),
                    this._formBuilder.group({
                        referenciaSolicitante: [this.usuario.referenciasSolicitante[2]?.referenciaSolicitante, [Validators.required]],
                        nombre: [this.usuario.referenciasSolicitante[2]?.nombre, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                        ],
                        apellido: [this.usuario.referenciasSolicitante[2]?.apellido, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]
                        ],
                        direccion: [this.usuario.referenciasSolicitante[2]?.direccion, [
                            Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\\s]+')]
                        ],
                        telefono: [this.usuario.referenciasSolicitante[2]?.telefono, [Validators.required,
                            Validators.maxLength(10),
                            Validators.minLength(10),
                            Validators.pattern('^[0-9]*$')]],
                        pais: [this.usuario.referenciasSolicitante[2]?.pais, [Validators.required]],
                        provincia: [this.usuario.referenciasSolicitante[2]?.provincia, [Validators.required]],
                        ciudad: [this.usuario.referenciasSolicitante[2]?.ciudad, [Validators.required]],
                    })
                ], [ValidacionesPropias.parientesTelefonosConsumo, ValidacionesPropias.padresConsumo]),
                ingresosSolicitante: this._formBuilder.group({
                    sueldoMensual: [this.usuario.ingresosSolicitante?.sueldoMensual, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    sueldoConyuge: [this.usuario.ingresosSolicitante?.sueldoConyuge, [Validators.pattern('^([0-9])*$')]],
                    otrosIngresos: [this.usuario.ingresosSolicitante?.otrosIngresos, [Validators.pattern('^([0-9])+$')]],
                    descripcion: [this.usuario.ingresosSolicitante?.descripcion],
                    totalIngresos: [this.usuario.ingresosSolicitante?.totalIngresos],
                }),
                gastosSolicitante: this._formBuilder.group({
                    alimentacion: [this.usuario.gastosSolicitante?.alimentacion, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    arriendo: [this.usuario.gastosSolicitante?.arriendo, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    vestido: [this.usuario.gastosSolicitante?.vestido, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    trasporte: [this.usuario.gastosSolicitante?.trasporte, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    serviciosBasicos: [this.usuario.gastosSolicitante?.serviciosBasicos, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    medicina: [this.usuario.gastosSolicitante?.medicina, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    educacion: [this.usuario.gastosSolicitante?.educacion, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    otrosPrestamos: [this.usuario.gastosSolicitante?.otrosPrestamos, [Validators.required, Validators.pattern('^([0-9])+$')]],
                    otrosGastos: [this.usuario.gastosSolicitante?.otrosGastos, [Validators.pattern('^([0-9])+$')]],
                    descripcion: [this.usuario.gastosSolicitante?.descripcion],
                    totalGastos: [this.usuario.gastosSolicitante?.totalGastos],
                }),
                autorizacion: ['', [Validators.requiredTrue]],
                garante: this._formBuilder.group({
                    tipoIdentificacion: [this.usuario.garante?.tipoIdentificacion, []],
                    identificacion: [this.usuario.garante?.identificacion, []],
                    nombres: [this.usuario.garante?.nombres, []],
                    apellidos: [this.usuario.garante?.apellidos, []],
                    pais: [this.usuario.garante?.pais, []],
                    provincia: [this.usuario.garante?.provincia, []],
                    ciudad: [this.usuario.garante?.ciudad, []],
                    direccion: [this.usuario.garante?.direccion, []],
                    tipoPersona: [this.usuario.garante?.tipoPersona, []],
                    paisTipoPersona: [this.usuario.garante?.paisTipoPersona, []],
                    provinciaTipoPersona: [this.usuario.garante?.provinciaTipoPersona, []],
                    ciudadTipoPersona: [this.usuario.garante?.ciudadTipoPersona, []],
                    direccionTipoPersona: [this.usuario.garante?.direccionTipoPersona, []],
                    rucGarante: [this.usuario.garante?.rucGarante, []],
                    nombreNegocioGarante: [this.usuario.garante?.nombreNegocioGarante, []],
                }),
            }
        );
        this.fecha = this.usuario.fechaNacimiento;

        // this.personaForm.patchValue(this.usuario);
        console.log('.....--', this.usuario);
        this.tipoViviendaSelected();
        this.obtenerArrays();
        this.obtenerPaisTipoPersonaOpciones();
        this.obtenerProvinciaTipoPersonaOpciones();
        this.obtenerCiudadTipoPersonaOpciones();
        this.alfa = (this.tipoPersonaStorage === 'Alfa');
    }

    obtenerArrays() {
        this.paramService.obtenerListaTipo('PAIS').subscribe((info) => {
            this.paises = this.paisEmpresa = this.paisReferido1 = this.paisReferido2 = this.paisReferido3 = info;
        });
        this.paramService.obtenerListaTipo('PROVINCIA').subscribe((info) => {
            this.provincias = this.provinciaEmpresa = this.provinciaReferido1 = this.provinciaReferido2 = this.provinciaReferido3 = info;
        });
        this.paramService.obtenerListaTipo('Ciudad').subscribe((info) => {
            this.ciudades = this.ciudadEmpresa = this.ciudadReferido1 = this.ciudadReferido2 = this.ciudadReferido3 = info;
        });
    }
    obtenerPaisOpciones(event = null, variablePais) {
        const idPadre = this.paises.find(item => item.nombre === event?.target.value)?._id;
        this[variablePais] = this.paises.filter(item => item.idPadre === idPadre);
    }

    obtenerProvinciaOpciones(event = null, variableProvincia) {
        const idPadre = this.paises.find(item => item.nombre === event?.target.value)?._id;
        this[variableProvincia] = this.provincias.filter(item => item.idPadre === idPadre);
    }

    obtenerCiudadOpciones(event = null, variableCiudad) {
        console.log(variableCiudad);
        const idPadre = this.provincias.find(item => item.nombre === event?.target.value)?._id;
        this[variableCiudad] = this.ciudades.filter(item => item.idPadre === idPadre);
    }

    obtenerPaisTipoPersonaOpciones() {
        this.paramService.obtenerListaPadres('PAIS').subscribe((info) => {
            this.paisTipoPersonaOpciones = info;
        });
    }

    obtenerProvinciaTipoPersonaOpciones() {
        this.paramService
            .obtenerListaHijos(this.personaForm.value.garante.paisTipoPersona, 'PAIS')
            .subscribe((info) => {
                this.provinciaTipoPersonaOpciones = info;
            });
    }

    obtenerCiudadTipoPersonaOpciones() {
        this.paramService
            .obtenerListaHijos(this.personaForm.value.garante.provinciaTipoPersona, 'PROVINCIA')
            .subscribe((info) => {
                this.ciudadTipoPersonaOpciones = info;
            });
    }

    obtenerTipoIdentificacion() {
        if (this.personaForm.value.garante.tipoIdentificacion === 'Ruc') {
            this.personaForm.get('garante')['controls']['identificacion'].setValidators(
                [Validators.required, ValidacionesPropias.rucValido]
            );
            this.personaForm.get('garante')['controls']['identificacion'].updateValueAndValidity();
        } else {
            this.personaForm.get('garante')['controls']['identificacion'].setValidators(
                [Validators.required, ValidacionesPropias.cedulaValido]
            );
            this.personaForm.get('garante')['controls']['identificacion'].updateValueAndValidity();
        }
    }

    tipoPersonaGarante($event) {
        if ($event.target.value === 'negocio') {
            this.garanteNegocio = true;
            this.personaForm.get('garante')['controls']['rucGarante'].setValidators(
                [Validators.required, ValidacionesPropias.rucValido]
            );
            this.personaForm.get('garante')['controls']['nombreNegocioGarante'].setValidators(
                [Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\\s]+')]
            );
            this.personaForm.get('garante')['controls']['rucGarante'].updateValueAndValidity();
            this.personaForm.get('garante')['controls']['nombreNegocioGarante'].updateValueAndValidity();
        } else {
            this.garanteNegocio = false;
            this.personaForm.get('garante')['controls']['rucGarante'].clearValidators();
            this.personaForm.get('garante')['controls']['nombreNegocioGarante'].clearValidators();
            this.personaForm.get('garante')['controls']['rucGarante'].updateValueAndValidity();
            this.personaForm.get('garante')['controls']['nombreNegocioGarante'].updateValueAndValidity();
        }
    }

    seleccionarTipoPersona($event) {
        if ($event.target.value !== 'Alfa') {
            this.alfa = false;
            (this.personaForm as FormGroup).setControl('garante', this._formBuilder.group({
                tipoIdentificacion: ['', []],
                identificacion: ['', []],
                nombres: ['', []],
                apellidos: ['', []],
                pais: ['', []],
                provincia: ['', []],
                ciudad: ['', []],
                direccion: ['', []],
                tipoPersona: ['', []],
                paisTipoPersona: ['', []],
                provinciaTipoPersona: ['', []],
                ciudadTipoPersona: ['', []],
                direccionTipoPersona: ['', []],
                rucGarante: ['', []],
                nombreNegocioGarante: ['', []],
            }));
        } else {
            this.alfa = true;
            (this.personaForm as FormGroup).setControl('garante', this._formBuilder.group({
                tipoIdentificacion: [this.usuario.garante?.tipoIdentificacion, [Validators.required]],
                identificacion: [this.usuario.garante?.identificacion, [Validators.required, ValidacionesPropias]],
                nombres: [this.usuario.garante?.nombres, [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                apellidos: [this.usuario.garante?.apellidos, [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
                pais: [this.usuario.garante?.pais, [Validators.required]],
                provincia: [this.usuario.garante?.provincia, [Validators.required]],
                ciudad: [this.usuario.garante?.ciudad, [Validators.required]],
                direccion: [this.usuario.garante?.direccion, [Validators.required, Validators.minLength(20), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\\s]+')]],
                tipoPersona: [this.usuario.garante?.tipoPersona, [Validators.required]],
                paisTipoPersona: [this.usuario.garante?.paisTipoPersona, [Validators.required]],
                provinciaTipoPersona: [this.usuario.garante?.provinciaTipoPersona, [Validators.required]],
                ciudadTipoPersona: [this.usuario.garante?.ciudadTipoPersona, [Validators.required]],
                direccionTipoPersona: [this.usuario.garante?.direccionTipoPersona, [Validators.required,
                    Validators.minLength(20), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\\s]+')]],
                rucGarante: [this.usuario.garante?.rucGarante, []],
                nombreNegocioGarante: [this.usuario.garante?.nombreNegocioGarante, []],
            }));
        }
    }

    valoresLocalStorage() {
        this.estadoCivilStorage = localStorage.getItem('estadoCivil');
        if (this.estadoCivilStorage === 'Casado' || this.estadoCivilStorage === 'Unión libre') {
            this.casado = true;
        } else {
            this.casado = false;
        }
        this.tipoPersonaStorage = localStorage.getItem('tipoPersona');
        this.montoCreditoFinalStorage = localStorage.getItem('montoCreditoFinal');
        this.coutaMensualStorage = localStorage.getItem('coutaMensual');
        this.montoInteresStorage = localStorage.getItem('montoInteres');
    }


    calcularEdad() {
        const edad = moment().diff(new Date(this.personaForm.get('fechaNacimiento').value), 'years');
        this.personaForm.get('edad').patchValue(edad);
        if (edad < 18) {
            this.personaForm.get('fechaNacimiento').setErrors({valid: false});
        }
    }

    otroIngresos(value) {
        if (value > 0) {
            this.ingreSolicitanteForm['descripcion'].setValidators([Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]*')]);
            this.ingreSolicitanteForm['descripcion'].setValue(this.ingreSolicitanteForm?.['descripcion'].value);
        } else {
            this.ingreSolicitanteForm['descripcion'].setValidators(null);
            this.ingreSolicitanteForm['descripcion'].setValue(this.ingreSolicitanteForm?.['descripcion'].value);
        }
    }

    obtenerListas() {

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
        this.paramService.obtenerListaPadres('GENERO').subscribe((info) => {
            this.generos = info;
        });
        // this.tipoParentesco = ['Padre', 'Madre', 'Tío', 'Tía'];
        this.paramService.obtenerListaPadres('NIVEL_INSTRUCCION').subscribe((info) => {
            this.tipoNivelInstrucciones = info;
        });
        this.paramService.obtenerListaPadres('TIPO_PARIENTE').subscribe((info) => {
            this.tipoParentesco = info;
        });
        this.paramService.obtenerListaPadres('TIPO_VIVIENDA').subscribe((info) => {
            this.tipoViviendas = info;
        });
        this.paramService.obtenerListaPadres('ESTADO_CIVIL').subscribe((info) => {
            this.estadoCivilOptions = info;
        });
        this.paramService.obtenerListaPadres('TIPO_PERSONA').subscribe((info) => {
            this.tipoPersona = info;
        });
        this.paramService.obtenerListaPadres('TIPO_IDENTIFICACION').subscribe((info) => {
            this.tipoIdentificacion = info;
        });
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    validadorDeCedula(cedula: String) {
        let cedulaCorrecta = false;
        if (cedula.length === 10) {
            const tercerDigito = parseInt(cedula.substring(2, 3), 10);
            if (tercerDigito < 6) {
                // El ultimo digito se lo considera dígito verificador
                const coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
                const verificador = parseInt(cedula.substring(9, 10), 10);
                let suma = 0;
                let digito = 0;
                for (let i = 0; i < (cedula.length - 1); i++) {
                    digito = parseInt(cedula.substring(i, i + 1), 10) * coefValCedula[i];
                    suma += ((parseInt((digito % 10) + '', 10) + (parseInt((digito / 10) + '', 10))));
                }
                suma = Math.round(suma);
                if ((Math.round(suma % 10) === 0) && (Math.round(suma % 10) === verificador)) {
                    cedulaCorrecta = true;
                } else if ((10 - (Math.round(suma % 10))) === verificador) {
                    cedulaCorrecta = true;
                } else {
                    cedulaCorrecta = false;
                }
            } else {
                cedulaCorrecta = false;
            }
        } else {
            cedulaCorrecta = false;
        }
        if (!cedulaCorrecta) {
            this.personaForm.get('documento').setErrors({valido: cedulaCorrecta});
        }
    }

    tipoViviendaSelected() {
        if (this.personaForm.get('tipoVivienda').value === 'Propia' || this.personaForm.get('tipoVivienda').value === '') {
            this.nombreDueno = false;
            (this.personaForm as FormGroup).setControl('whatsappDueno', new FormControl());
        } else {
            this.nombreDueno = true;
            (this.personaForm as FormGroup).setControl('whatsappDueno',
                new FormControl(this.personaForm.value?.whatsappDueno,
                    [
                        Validators.required, Validators.minLength(10),
                        Validators.maxLength(10), Validators.pattern('^([0-9])+$')
                    ]));
        }
    }

    tipoEstadocivilSelected() {
        if (this.personaForm.get('estadoCivil').value === 'Casado' || this.personaForm.get('estadoCivil').value === 'Unión libre') {
            this.casado = true;
        } else {
            this.casado = false;
        }
    }

    validadorDePasaporte(pasaporte: String) {
        const ExpRegNumDec = '^([A-Za-z0-9]){4,25}$';
        if (pasaporte.match(ExpRegNumDec) != null) {
        }
        if (pasaporte.match(ExpRegNumDec) == null) {
            this.personaForm.get('documento').setErrors({validoPas: false});
        }
    }

    calculos() {
        // Total de ingresos
        let total = 0;
        let totalgastos = 0;
        for (const item in this.personaForm.get('ingresosSolicitante')['controls']) {
            if (item !== 'descripcion') {
                if (item !== 'totalIngresos') {
                    // if (item !== 'sueldoConyuge') {
                    total += parseInt((this.personaForm.get('ingresosSolicitante')['controls'][item].value) ? (this.personaForm.get('ingresosSolicitante')['controls'][item].value) : 0);
                    // }
                }
            }
        }
        this.personaForm.get('ingresosSolicitante').get('totalIngresos').setValue(total);

        for (const item in this.personaForm.get('gastosSolicitante')['controls']) {
            if (item !== 'descripcion') {
                if (item !== 'totalGastos') {
                    totalgastos += parseInt((this.personaForm.get('gastosSolicitante')['controls'][item].value) ? (this.personaForm.get('gastosSolicitante')['controls'][item].value) : 0);
                }
            }
        }
        this.personaForm.get('gastosSolicitante').get('totalGastos').setValue(totalgastos);


    }

    calcularCredito() {
        const ingresosTotal = this.personaForm.get('ingresosSolicitante')['controls']['totalIngresos'].value
            ? new Decimal(this.personaForm.get('ingresosSolicitante')['controls']['totalIngresos'].value).toNumber()
            : 0;
        const gastosTotal = this.personaForm.get('gastosSolicitante')['controls']['totalGastos'].value
            ? new Decimal(this.personaForm.get('gastosSolicitante')['controls']['totalGastos'].value).toNumber()
            : 0;
        // Formula para el calculo interes
        const ingresosConyuge = new Decimal((this.personaForm.get('ingresosSolicitante')['controls']['sueldoConyuge'].value ? new Decimal(this.personaForm.get('ingresosSolicitante')['controls']['sueldoConyuge'].value).toNumber() : 0) / 2);
        const ingresosMensuales = new Decimal(ingresosTotal).sub(ingresosConyuge);
        const gastosMensuales = new Decimal(gastosTotal);
        const ingresoDisponible = ingresosMensuales.add(ingresosConyuge).sub(gastosMensuales).toDecimalPlaces(2).toNumber();
        if (ingresoDisponible === 0) {
            this.mensaje = '<b>¡Lo sentimos!</b><br> Con los datos ingresados en el simulador, lamentamos informarle que no cuenta con Capacidad de Pago. Actualice los datos e intente de nuevo';
            this.abrirModalLg(this.modalAviso);
            return;
        }
        const capacidadPago = new Decimal(ingresoDisponible).mul(this.porcentajeCapacidaPago).floor().toNumber();

        const montoInteresMensual = new Decimal(capacidadPago).mul((this.tasaInteres / 100)).toDecimalPlaces(2).toNumber();

        let cuotaMensual = new Decimal(capacidadPago).add(montoInteresMensual).toDecimalPlaces(2).toNumber();

        const montoCredito = new Decimal(cuotaMensual).mul(12).toNumber();

        if (montoCredito === 0) {
            this.mensaje = '<b>¡Lo sentimos!</b><br> Con los datos ingresados en el simulador, lamentamos informarle que no cuenta con Capacidad de Pago. Actualice los datos e intente de nuevo';
            this.abrirModalLg(this.modalAviso);
            return false;
        }
        const resto = new Decimal(montoCredito.toString().substr(2, 4));
        const montoCreditoRedondeado = new Decimal(montoCredito).sub(resto).toNumber();
        let montoCreditoFinal = 0;
        if (montoCreditoRedondeado < this.montoMinimo) {
            this.mensaje = '<b>¡Lo sentimos!</b><br> Con los datos ingresados en el simulador, lamentamos informarle que no cuenta con Capacidad de Pago. Actualice los datos e intente de nuevo';
            this.abrirModalLg(this.modalAviso);
            return false;
        } else if (montoCreditoRedondeado >= this.montoMaximo) {
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


    continuar() {
        console.log('no valido ', this.personaForm);

        // return;
        if (this.personaForm.value.tipoIdentificacion === 'Cédula') {
            this.validadorDeCedula(this.personaForm.value.documento);
        }
        if (this.personaForm.value.tipoIdentificacion === 'Pasaporte') {
            this.validadorDePasaporte(this.personaForm.value.documento);
        }
        this.calcularEdad();
        this.submittedPersona = true;
        // console.log('antes de validar', this.personaForm);

        if (this.personaForm.invalid) {
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            console.log('no valido ', this.personaForm);
            return;
        }

        this.calculos();
        if (!this.calcularCredito()) {
            return;
        }

        this.personaForm.get('fechaNacimiento').setValue(moment(this.personaForm.get('fechaNacimiento').value[0]).format('YYYY-MM-DD'));
        const persona = {
            identificacion: this.personaForm.get('documento').value,
            ...this.personaForm.value,
            user_id: this.user_id,
            imagen: []
        };
        const grpPersonasUser = this._coreMenuService.grpPersonasUser;
        grpPersonasUser.persona = persona;
        localStorage.setItem('grpPersonasUser', JSON.stringify(grpPersonasUser));
        this._creditosAutonomosService.guardarInformacion(persona)
            .subscribe((info) => {
                localStorage.setItem('tipoPersona', this.personaForm.get('tipoPersona').value);
                this.estado.emit(3);

            });
    }

    abrirModalLg(modal) {
        this.modalService.open(modal, {
            size: 'lg'
        });
    }

    mostrarTerminos(event: Event, modal: any) {
        event.preventDefault();
        this.modalService.open(modal, {
            size: 'lg'
        });
    }

    comprobarOtrosGastos(event) {
        if (event.target.value > 0) {
            console.log('validar');
            (this.personaForm as FormGroup).setControl('especificaGastos',
                new FormControl(this.personaForm.value?.descripcion,
                    [Validators.required, Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]));
        } else {
            (this.personaForm as FormGroup).setControl('especificaGastos',
                new FormControl(this.personaForm.value?.descripcion));
        }
    }
}
