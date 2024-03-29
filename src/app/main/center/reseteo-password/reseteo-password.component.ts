import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {Router, ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {ReseteoPasswordService} from './reseteo-password.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

/*
* IFIS
* Personas
* Esta pantalla sirve para restablecer la contraseña
* Rutas:
* `${environment.apiUrl}/central/auth/password_reset/confirm/`,
* `${environment.apiUrl}/central/usuarios/update/by/email/`,
* */

@Component({
    selector: 'app-reseteo-password',
    templateUrl: './reseteo-password.component.html',
    styleUrls: ['./reseteo-password.component.scss']
})
export class ReseteoPasswordComponent implements OnInit, OnDestroy {
    @ViewChild('mensajeModalConfirm') mensajeModalConfirm;

    // Public
    public coreConfig: any;
    public forgotPasswordForm: FormGroup;
    public submitted = false;
    public data;
    public error;
    public passwordTextType: boolean;
    public confirmPasswordTextType: boolean;
    public passwordSimilar: boolean;
    public token;
    public mensaje = '';
    public email;
    // Private
    private _unsubscribeAll: Subject<any>;
    public captcha: boolean;
    public siteKey: string;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _reseteoPasswordService: ReseteoPasswordService,
        private _activatedRoute: ActivatedRoute,
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

    // convenience getter for easy access to form fields
    get f() {
        return this.forgotPasswordForm.controls;
    }

    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this._activatedRoute.queryParams.subscribe(params => {
            this.token = params.token;
            this.email = params.email;
        });

        this.forgotPasswordForm = this._formBuilder.group({
            password: ['', [Validators.minLength(8),
                Validators.pattern('(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'),
                Validators.required]],
            confirmPassword: ['', [Validators.required]]
        });

        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    togglePasswordTextType() {
        this.passwordTextType = !this.passwordTextType;
    }

    toggleConfirmPasswordTextType() {
        this.confirmPasswordTextType = !this.confirmPasswordTextType;
    }

    /**
     * On destroy
     */

    resetearPassword() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.forgotPasswordForm.invalid || !this.passwordSimilar || !this.captcha) {
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        this._reseteoPasswordService.resetearPassword(
            {
                password: this.f.password.value,
                token: this.token,
                email: this.email
            }
        ).subscribe((info) => {
                this.error = null;
                if (info.status) {
                    this._reseteoPasswordService.updateUsuarioByEmail({email: this.email}).subscribe((info) => {
                        this.mensaje = 'Contraseña actualizada correctamente, haga click en continuar para ir a la página de inicio';
                        this.abrirModal(this.mensajeModalConfirm);
                    }, (error) => {
                        console.log(error);
                    });
                }
            },
            (error) => {
                this.error = ['Verifique si su contraseña es correcta'];
                // console.log(error);
                // this.error = error.error.password;
            });
    }

    redirigir() {
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }

    compararPassword() {
        this.passwordSimilar = this.f.password.value === this.f.confirmPassword.value;
    }

    abrirModal(modal) {
        this._modalService.open(modal);
    }

    cerrarModal() {
        this._modalService.dismissAll();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    captchaValidado(evento) {
        this.captcha = true;
    }
}
