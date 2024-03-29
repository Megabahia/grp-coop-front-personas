import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CompletarPerfil, SolicitarCredito} from '../../models/persona';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../../auth/models';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {CreditosAutonomosService} from '../creditos-autonomos/creditos-autonomos.service';
import {BienvenidoService} from '../bienvenido/bienvenido.service';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {takeUntil} from 'rxjs/operators';
import moment from 'moment/moment';

/**
 * Bigpuntos
 * Personas
 * ESta pantalla sirve para solicitar el credito
 * Rutas:
 * `${environment.apiUrl}/personas/personas/listOne/${id}`
 * `${environment.apiUrl}/personas/personas/updateSinImagen/${datos.user_id}`,
 * `${environment.apiUrl}/central/usuarios/update/${datos.id}`,
 * `${environment.apiUrl}/corp/creditoPersonas/create/`,
 */

@Component({
    selector: 'app-credito-consumo-digital',
    templateUrl: './credito-consumo-digital.component.html',
    styleUrls: ['./credito-consumo-digital.component.scss']
})
export class CreditoConsumoDigitalComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('startDatePicker') startDatePicker;
    @ViewChild('whatsapp') whatsapp;
    public error;
    public informacion: CompletarPerfil;
    public coreConfig: any;
    public imagen;
    public registerForm: FormGroup;
    public loading = false;
    public submitted = false;
    public usuario: User;
    public idEmpresa = '';
    public proceso = 1;
    public solicitarCredito: SolicitarCredito;
    public startDateOptions: FlatpickrOptions = {
        altInput: true,
        mode: 'single',
        altFormat: 'Y-n-j',
        altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    };
    public codigo;
    public fecha;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _coreMenuService: CoreMenuService,
        private _creditosAutonomosService: CreditosAutonomosService,
        private _bienvenidoService: BienvenidoService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private modalService: NgbModal
    ) {
        this.informacion = {
            apellidos: '',
            user_id: '',
            edad: 0,
            fechaNacimiento: '',
            genero: '',
            identificacion: '',
            nombres: '',
            whatsapp: ''
        };
        this.solicitarCredito = this.inicialidarSolicitudCredito();
        this._unsubscribeAll = new Subject();
    }

    inicialidarSolicitudCredito(): SolicitarCredito {
        return {
            _id: '',
            aceptaTerminos: 0,
            empresaComercial_id: '',
            empresaIfis_id: '',
            estado: 'Confirmado',
            monto: 0,
            cuota: 0,
            plazo: 0,
            user_id: '',
            canal: 'Autonomo',
            tipoCredito: 'Autonomo',
            concepto: 'Autonomo',
            nombres: '',
            apellidos: '',
            numeroIdentificacion: '',
        };
    }

    get f() {
        return this.registerForm.controls;
    }

    ngOnInit(): void {

        this.usuario = this._coreMenuService.grpPersonasUser;

        this.registerForm = this._formBuilder.group({
            identificacion: ['', [Validators.required]],
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            genero: ['', Validators.required],
            fechaNacimiento: ['string', Validators.required],
            edad: ['', Validators.required],
            whatsapp: ['', Validators.required],
        });
        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
        this._creditosAutonomosService.obtenerInformacion(this.usuario.id).subscribe(info => {
            this.fecha = info.fechaNacimiento;
            this.registerForm.patchValue({
                identificacion: info.identificacion,
                nombres: info.nombres,
                apellidos: info.apellidos,
                genero: info.genero,
                // fechaNacimiento: [info.fechaNacimiento],
                edad: info.edad,
                whatsapp: info.whatsapp,
            });
        });
    }

    ngAfterViewInit(): void {
        this.solicitarCredito.user_id = this.usuario.id;
    }

    subirImagen(event: any) {
        if (event.target.files && event.target.files[0]) {
            const nuevaImagen = event.target.files[0];

            const reader = new FileReader();

            reader.onload = (event: any) => {
                this.imagen = event.target.result;
            };

            reader.readAsDataURL(event.target.files[0]);
            const imagen = new FormData();
            imagen.append('imagen', nuevaImagen, nuevaImagen.name);

        }
    }

    calcularEdad() {
        this.informacion.edad = moment().diff(this.f.fechaNacimiento.value[0], 'years');
        this.informacion.fechaNacimiento = moment(this.f.fechaNacimiento.value[0]).format('YYYY-MM-DD');
        this.registerForm.patchValue({
            edad: this.informacion.edad
        });
    }

    guardarRegistro() {

        this.submitted = true;
        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        this.informacion.apellidos = this.f.apellidos.value;
        this.informacion.edad = this.f.edad.value;
        // this.informacion.fechaNacimiento = this.f.fechaNacimiento.value;;
        this.informacion.genero = this.f.genero.value;
        this.informacion.identificacion = this.f.identificacion.value;
        this.informacion.nombres = this.f.nombres.value;
        this.informacion.whatsapp = this.f.whatsapp.value;
        this.informacion.user_id = this.usuario.id;

        this._creditosAutonomosService.guardarInformacion(this.informacion).subscribe(info => {
            this._bienvenidoService.cambioDeEstado(
                {
                    estado: '3',
                    id: this.usuario.id
                }
            ).subscribe(infoCambio => {
                this.usuario.estado = '3';
                this.usuario.persona = info;
                localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
            });
        });
    }

    continuar(value) {
        console.log('proeso', value);
        if (value === 7) {
            // Agregar informacion al credito
            console.log('this.usuario.persona', this.usuario.persona.tipoPersona);
            console.log('this.usuario.persona', this.usuario);
            this.solicitarCredito.nombres = this.usuario.persona.nombres;
            this.solicitarCredito.apellidos = this.usuario.persona.apellidos;
            this.solicitarCredito.numeroIdentificacion = this.usuario.persona.identificacion;
            this.solicitarCredito.tipoCredito = this.usuario.persona.tipoPersona;
            this._creditosAutonomosService.crearCredito(this.solicitarCredito).subscribe((info) => {
                this.proceso = value;
            });
        } else {

            this.proceso = value;
        }
    }

    obtenerIdIfi(value) {
        console.log(value);
        this.solicitarCredito.empresaIfis_id = value;
    }

    obtenerEstablecimiento(value) {
        this.solicitarCredito.empresaComercial_id = value;
        this.idEmpresa = value;
    }

    obtenerMonto(value) {
        this.solicitarCredito.plazo = value.plazo;
        this.solicitarCredito.monto = value.monto;
        this.solicitarCredito.aceptaTerminos = value.aceptaTerminos ? 1 : 0;
    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
