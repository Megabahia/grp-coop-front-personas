import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CoreConfigService} from '@core/services/config.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {RegistroService} from './registro.service';
import {Role} from '../../../auth/models/role';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from "../../../../environments/environment";
import {ToastrService} from 'ngx-toastr';


@Component({
    selector: 'app-registro',
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
    @ViewChild('mensajeModal') mensajeModal;
    @ViewChild('mensajeConfirmModal') mensajeConfirmModal;
    //  Public
    public coreConfig: any;
    public registerForm: FormGroup;
    public loading = false;
    public submitted = false;
    public returnUrl: string;
    public mensaje: string;
    public mensajeConfirm = '';
    public error = '';
    public passwordTextType: boolean;
    public confirmPasswordTextType: boolean;
    public passwordSimilar: boolean;

    // Private
    private _unsubscribeAll: Subject<any>;
    public captcha: boolean;
    public siteKey: string;
    public email = '';
    public nombre = '';

    /**
     * Constructor
     *
     * @param {CoreConfigService} _coreConfigService
     */
    constructor(
        private _coreConfigService: CoreConfigService,
        private _registroService: RegistroService,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private _modalService: NgbModal,
        private toastr: ToastrService,
    ) {
        this.siteKey = environment.setKey;
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._coreConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                menu: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                customizer: false,
                enableLocalStorage: false
            }
        };
        this._route.queryParams.subscribe(params => {
            this.email = params['email'];
            this.nombre = params['nombre'];
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.registerForm.controls;
    }

    /**
     * Toggle password
     */
    togglePasswordTextType() {
        this.passwordTextType = !this.passwordTextType;
    }

    toggleConfirmPasswordTextType() {
        this.confirmPasswordTextType = !this.confirmPasswordTextType;
    }

    registrarUsuario() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid || !this.captcha) {
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }

        // Login
        this.error = null;
        this.loading = true;
        this._registroService.registrarUsuario(
            {
                // password: this.f.password.value,
                roles: Role.SuperMonedas,
                email: this.f.correo.value,
                estado: 1,
                tipoUsuario: 'core'
            }
        ).subscribe((info) => {

                if (info.email == 'Ya existe usuarios con este email.') {
                    this.error = null;
                    this.loading = false;
                    this.mensaje = info.email;
                    this.abrirModal(this.mensajeModal);
                } else {
                    this.error = null;
                    this.loading = false;
                    localStorage.setItem('grpPersonasUser', JSON.stringify(info));
                    this.mensajeConfirm = 'Se ha enviado al correo electrónico registrado el Link para completar su Registro';
                    this.abrirModal(this.mensajeConfirmModal);
                }

            },
            (error) => {
                this.error = null;
                this.loading = false;
                this.mensaje = 'Ha ocurrido un error en su registro';
                this.abrirModal(this.mensajeModal);
                // this.error = error.error.password;
            });
        // redirect to home page

    }

    redirigir() {
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }

    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            correo: [this.email, [Validators.required, Validators.email]],
            // password: ['', [Validators.required]],
            // confirmPassword: ['', [Validators.required]],
            terminos: [false, [Validators.requiredTrue]]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    compararPassword() {
        if (this.f.password.value == this.f.confirmPassword.value) {
            this.passwordSimilar = true;
        } else {
            this.passwordSimilar = false;
        }
    }

    abrirModal(modal) {
        this._modalService.open(modal);
    }

    cerrarModal() {
        this._modalService.dismissAll();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    captchaValidado(evento) {
        this.captcha = true;
    }
}
