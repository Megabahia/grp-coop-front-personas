import {Component, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BienvenidoService} from '../bienvenido/bienvenido.service';
import {takeUntil} from 'rxjs/operators';
import {CompletarPerfilService} from './completar-perfil.service';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {CompletarPerfil} from '../../models/persona';
import moment from 'moment';
import {User} from '../../../../auth/models/user';
import {GanarSuperMoneda} from '../../models/supermonedas';
import {ParametrizacionesService} from '../../servicios/parametrizaciones.service';
import {ToastrService} from 'ngx-toastr';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import {SolicitudCreditosService} from '../solicitud-creditos/solicitud-creditos.service';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';

@Component({
    selector: 'app-completar-perfil',
    templateUrl: './completar-perfil.component.html',
    styleUrls: ['./completar-perfil.component.scss']
})
export class CompletarPerfilComponent implements OnInit {
    @ViewChild('startDatePicker') startDatePicker;
    @ViewChild('whatsapp') whatsapp;
    @ViewChild('mensajeModal') mensajeModal;
    public empresaId = '';

    public error;
    public informacion: CompletarPerfil;
    public coreConfig: any;
    public imagen;
    public superMonedas: GanarSuperMoneda;
    public ganarMonedas;
    public mensaje = '';
    public registerForm: FormGroup;
    public loading = false;
    public submitted = false;
    public usuario: User;
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
    public formSolicitud: FormGroup;

    /**
     * Constructor
     *
     * @param {CoreConfigService} _coreConfigService
     */
    constructor(
        private _coreConfigService: CoreConfigService,
        private _coreMenuService: CoreMenuService,
        private _completarPerfilService: CompletarPerfilService,
        private _bienvenidoService: BienvenidoService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private modalService: NgbModal,
        private paramService: ParametrizacionesService,
        private toastr: ToastrService,
        private _serviceUpdateEmpresa: SolicitudCreditosService,
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
    ) {
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.superMonedas = this.inicializarSuperMoneda();

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
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._coreConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                menu: {
                    hidden: true
                },
                customizer: false,
                enableLocalStorage: false
            }
        };
    }

    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------
    get f() {
        return this.registerForm.controls;
    }

    inicializarSuperMoneda(): GanarSuperMoneda {
        return {
            credito: 0,
            descripcion: '',
            tipo: 'Credito',
            user_id: this.usuario.id,
            empresa_id: this.empresaId
        };
    }

    get controlsFrom() {
        return this.formSolicitud.controls;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.obtenerEmpresaId();

        this.formSolicitud = this._formBuilder.group({
            // reprsentante: [this.usuario.persona.empresaInfo.reprsentante ?? '', [Validators.required, Validators.minLength(8),
            //     Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
            rucEmpresa: [this.usuario.persona.empresaInfo.rucEmpresa ?? '', [Validators.required, Validators.minLength(13),
                Validators.maxLength(13), Validators.pattern('^[0-9]+001$'), ValidacionesPropias.rucValido]],
            // comercial: [this.usuario.persona.empresaInfo.comercial ?? '', [
            // Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\\s]+')]
            // ],
            correo: [this.usuario.email ?? '', [Validators.required, Validators.email]],
        });

        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    obtenerEmpresaId() {
        this._bienvenidoService.obtenerEmpresa({
            nombreComercial: 'Global Red Pyme'
        }).subscribe((info) => {
            this.superMonedas.empresa_id = info._id;
        }, (error) => {
            this.mensaje = 'Ha ocurrido un error al actualizar su imagen';
            this.abrirModal(this.mensajeModal);
        });
    }

    ngAfterViewInit(): void {
        if (this.usuario.estado == '3') {
            this.modalWhatsapp(this.whatsapp);
        }
    }

    modalWhatsapp(modalVC) {
        this.modalService.open(modalVC);
    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }

    cerrarModal() {
        this.modalService.dismissAll();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    guardar() {
        this.submitted = true;
        if (this.formSolicitud.invalid) {
            console.log('fomulario', this.formSolicitud);
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        const values = {
            empresaInfo: this.formSolicitud.value,
            user_id: this.usuario.id,
        };
        this._serviceUpdateEmpresa.actualiarEmpresa(values).subscribe((valor) => {
            console.log('guardado', valor);
            const newJson = JSON.parse(localStorage.getItem('grpPersonasUser'));
            newJson.persona.empresaInfo = values.empresaInfo;
            localStorage.setItem('grpPersonasUser', JSON.stringify(newJson));
            this._coreMenuService.grpPersonasUser = newJson;
            const usuario = this._coreMenuService.grpPersonasUser;
            this._creditosPreAprobadosService.obtenerListaCreditos({
                page: 0,
                page_size: 10,
                user_id: this.usuario.id,
                estado: 'Aprobado',
            }).subscribe((info) => {
                console.log('creditos', info.info[0]?.estado);
                this._router.navigate(['/personas/registroFirmaElectronica']);
            });
            console.log(usuario);
        });
    }
}
