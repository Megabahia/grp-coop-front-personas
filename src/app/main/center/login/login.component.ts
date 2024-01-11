import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {first, takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {AuthenticationService} from '../../../auth/service';
import {ToastrService} from 'ngx-toastr';
import {
    SocialAuthService,
} from 'angularx-social-login';
import {RegistroService} from '../registro/registro.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreditosPreAprobadosService} from '../../personas/vistas/creditos-pre-aprobados/creditos-pre-aprobados.service';
import {CoreMenuService} from '../../../../@core/components/core-menu/core-menu.service';
import {environment} from '../../../../environments/environment';

/*
* COOP
* Personas
* ESta pantalla sirve para iniciar sesion en la aplicacion
* Rutas:
* `${environment.apiUrl}/central/auth/login/`
* `${environment.apiUrl}/central/usuarios/create/`,
* `${environment.apiUrl}/central/auth/loginFacebook/`
*/

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
    //  Public
    @ViewChild('captchaElem') captchaElem;

    @ViewChild('mensajeModal') mensajeModal;
    public mensaje = '';

    public coreConfig: any;
    public loginForm: FormGroup;
    public loading = false;
    public submitted = false;
    public returnUrl: string;
    public captcha: boolean;
    public siteKey: string;
    public error = '';
    public passwordTextType: boolean;
    private logginSubs: Subscription;

    public startDateOptions = {
        altInput: true,
        mode: 'single',
        altInputClass:
            'form-control flat-picker flatpickr-input invoice-edit-input',
        enableTime: true,
    };

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private _authenticationService: AuthenticationService,
        private socialAuthService: SocialAuthService,
        private _registroService: RegistroService,
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
        private _coreMenuService: CoreMenuService,
        private _modalService: NgbModal,
        private toastr: ToastrService,
    ) {
        this.siteKey = environment.setKey;
        this.captcha = false;
        this._unsubscribeAll = new Subject();

        // Configure the layout
        this._coreConfigService.config = {
            layout: {
                navbar: {
                    hidden: true,
                },
                menu: {
                    hidden: true,
                },
                footer: {
                    hidden: true,
                },
                customizer: false,
                enableLocalStorage: false,
            },
        };
        if (this._authenticationService.grpPersonasUserValue) {
            this._router.navigate(['/']);
        }
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    /**
     * Toggle password
     */
    togglePasswordTextType() {
        this.passwordTextType = !this.passwordTextType;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid || !this.captcha) {
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }

        // Login
        this.loading = true;
        this._authenticationService
            .login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data) => {
                    if (data.code === 400) {
                        this.mensaje = data.msg;
                        this.abrirModal(this.mensajeModal);
                        this.loading = false;
                    }
                    // this._router.navigate([this.returnUrl]);
                    const semilla = JSON.parse(localStorage.getItem('semillaPago'));
                    const simulador = localStorage.getItem('simulador');
                    switch (simulador) {
                        case 'ok':
                            this._creditosPreAprobadosService.obtenerListaCreditos({
                                page: 0,
                                page_size: 10,
                                user_id: data.id
                            }).subscribe((info) => {
                                console.log('creditos', info);
                                if (info.cont === 0) {
                                    if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                        this._router.navigate(['/personas/solucitudCredito']);
                                    } else {
                                        this._router.navigate(['/personas/creditos-autonomos/solicitar-credito']);
                                    }
                                    return;
                                }
                                const aprobado = info.info.find((item) => {
                                    if (item?.estado === 'Aprobado') {
                                        localStorage.setItem('estadoCredito', 'aprobado');
                                        return true;
                                    }
                                });
                                if (aprobado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const negado = info.info.find((item) => {
                                    if (item?.estado === 'Negado') {
                                        localStorage.setItem('estadoCredito', 'negado');
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return true;
                                    }
                                });
                                if (negado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const pendiente = info.info.find((item) => {
                                    if (item?.estado === 'Por completar') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return true;
                                    }
                                });
                                if (pendiente) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const nuevo = info.info.find((item) => {
                                    if (item?.estado === 'Nuevo') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return;
                                    }
                                });
                                if (nuevo) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                    this._router.navigate(['/personas/solucitudCredito']);
                                } else {
                                    this._router.navigate(['/personas/creditos-autonomos/solicitar-credito']);
                                }
                            });

                            break;
                        case 'Lineas Credito Digital':
                            this._creditosPreAprobadosService.obtenerListaCreditos({
                                page: 0,
                                page_size: 10,
                                user_id: data.id
                            }).subscribe((info) => {
                                console.log('creditos digitales');
                                if (info.cont === 0) {
                                    if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).canal.includes('Pymes')) {
                                        this._router.navigate(['/personas/solucitudCreditoDigital']);
                                        console.log('if', localStorage.getItem('credito'));
                                    } else {
                                        console.log('else', localStorage.getItem('credito'));
                                        this._router.navigate(['/personas/solucitudCreditoDigital']);
                                    }
                                    return;
                                }
                                const aprobado = info.info.find((item) => {
                                    if (item?.estado === 'Aprobado') {
                                        localStorage.setItem('estadoCredito', 'aprobado');
                                        return true;
                                    }
                                });
                                if (aprobado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const negado = info.info.find((item) => {
                                    if (item?.estado === 'Negado') {
                                        localStorage.setItem('estadoCredito', 'negado');
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return true;
                                    }
                                });
                                if (negado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const pendiente = info.info.find((item) => {
                                    if (item?.estado === 'Por completar') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return true;
                                    }
                                });
                                if (pendiente) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const nuevo = info.info.find((item) => {
                                    if (item?.estado === 'Nuevo') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return;
                                    }
                                });
                                if (nuevo) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).canal.includes('Pymes')) {
                                    this._router.navigate(['/personas/solucitudCreditoDigital']);
                                } else {
                                    console.log('else 2');
                                    this._router.navigate(['/personas/solucitudCreditoDigital']);
                                }
                            });

                            break;
                        case 'consumo':
                            console.log('llega de consumo----');
                            this._creditosPreAprobadosService.obtenerListaCreditos({
                                page: 0,
                                page_size: 10,
                                user_id: data.id
                            }).subscribe((info) => {
                                console.log('creditos', info);
                                if (info.cont === 0) {
                                    if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                        console.log('ingreso..');
                                        this._router.navigate(['/personas/solucitudCreditoDigital']);
                                    } else {
                                        this._router.navigate(['/personas/creditos-autonomos-digital/solicitar-credito-digital']);
                                    }
                                    return;
                                }
                                const aprobado = info.info.find((item) => {
                                    if (item?.estado === 'Aprobado') {
                                        localStorage.setItem('estadoCredito', 'aprobado');
                                        return true;
                                    }
                                });
                                if (aprobado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const negado = info.info.find((item) => {
                                    if (item?.estado === 'Negado') {
                                        localStorage.setItem('estadoCredito', 'negado');
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return true;
                                    }
                                });
                                if (negado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const pendiente = info.info.find((item) => {
                                    if (item?.estado === 'Por completar') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return true;
                                    }
                                });
                                if (pendiente) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const nuevo = info.info.find((item) => {
                                    if (item?.estado === 'Nuevo') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return;
                                    }
                                });
                                if (nuevo) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                    this._router.navigate(['/personas/solucitudCreditoDigital']);
                                } else {
                                    this._router.navigate(['/personas/creditos-autonomos-digital/solicitar-credito-digital']);
                                }
                            });

                            break;
                        case 'credito-automotriz':
                            this._creditosPreAprobadosService.obtenerListaCreditos({
                                page: 0,
                                page_size: 10,
                                user_id: data.id
                            }).subscribe((info) => {
                                if (info.cont === 0) {
                                    if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                        console.log('inhreso..');
                                        this._router.navigate(['/personas/solucitudCreditoDigital']);
                                    } else {
                                        this._router.navigate(['/personas/creditos-automotriz/solicitar-credito']);
                                    }
                                    return;
                                }
                                const aprobado = info.info.find((item) => {
                                    if (item?.estado === 'Aprobado') {
                                        localStorage.setItem('estadoCredito', 'aprobado');
                                        return true;
                                    }
                                });
                                if (aprobado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const negado = info.info.find((item) => {
                                    if (item?.estado === 'Negado') {
                                        localStorage.setItem('estadoCredito', 'negado');
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return true;
                                    }
                                });
                                if (negado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const pendiente = info.info.find((item) => {
                                    if (item?.estado === 'Por completar') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return true;
                                    }
                                });
                                if (pendiente) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const nuevo = info.info.find((item) => {
                                    if (item?.estado === 'Nuevo') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return;
                                    }
                                });
                                if (nuevo) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                    this._router.navigate(['/personas/solucitudCreditoDigital']);
                                } else {
                                    this._router.navigate(['/personas/creditos-automotriz/solicitar-credito']);
                                }
                            });

                            break;
                        case 'credito-automotriz-digital':
                            this._creditosPreAprobadosService.obtenerListaCreditos({
                                page: 0,
                                page_size: 10,
                                user_id: data.id
                            }).subscribe((info) => {
                                if (info.cont === 0) {
                                    if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                        console.log('inhreso..');
                                        this._router.navigate(['/personas/solucitudCreditoDigital']);
                                    } else {
                                        this._router.navigate(['/personas/creditos-automotriz-digital/solicitar-credito-digital']);
                                    }
                                    return;
                                }
                                const aprobado = info.info.find((item) => {
                                    if (item?.estado === 'Aprobado') {
                                        localStorage.setItem('estadoCredito', 'aprobado');
                                        return true;
                                    }
                                });
                                if (aprobado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const negado = info.info.find((item) => {
                                    if (item?.estado === 'Negado') {
                                        localStorage.setItem('estadoCredito', 'negado');
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return true;
                                    }
                                });
                                if (negado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const pendiente = info.info.find((item) => {
                                    if (item?.estado === 'Por completar') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return true;
                                    }
                                });
                                if (pendiente) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                const nuevo = info.info.find((item) => {
                                    if (item?.estado === 'Nuevo') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                        return;
                                    }
                                });
                                if (nuevo) {
                                    this._router.navigate(['/personas/estado-solicitud-credito-digital']);
                                    return;
                                }
                                if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                    this._router.navigate(['/personas/solucitudCreditoDigital']);
                                } else {
                                    this._router.navigate(['/personas/creditos-automotriz-digital/solicitar-credito-digital']);
                                }
                            });

                            break;
                        default:
                            const usuario = this._coreMenuService.grpPersonasUser;
                            this._creditosPreAprobadosService.obtenerListaCreditos({
                                page: 0,
                                page_size: 10,
                                user_id: data.id
                            }).subscribe((info) => {
                                if (info.info[0]?.activarMenu) {
                                    this._coreMenuService.grpPersonasUser.documentosFirmados = 1;
                                    localStorage.setItem('grpPersonasUser', JSON.stringify(this._coreMenuService.grpPersonasUser));
                                } else {
                                    this._coreMenuService.grpPersonasUser.documentosFirmados = 0;
                                    localStorage.setItem('grpPersonasUser', JSON.stringify(this._coreMenuService.grpPersonasUser));
                                }
                                console.log('creditos', info.info[0]?.estado);
                                if (info.cont === 0) {
                                    this._router.navigate(['/personas/completarPerfil']);
                                    return;
                                }
                                const aprobado = info.info.find((item) => {
                                    if (item?.estado === 'Aprobado') {
                                        localStorage.setItem('estadoCredito', 'aprobado');
                                        return true;
                                    }
                                });
                                if (aprobado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const negado = info.info.find((item) => {
                                    if (item?.estado === 'Negado') {
                                        localStorage.setItem('estadoCredito', 'negado');
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return true;
                                    }
                                });
                                if (negado) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const pendiente = info.info.find((item) => {
                                    if (item?.estado === 'Por completar') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return true;
                                    }
                                });
                                if (pendiente) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                const nuevo = info.info.find((item) => {
                                    if (item?.estado === 'Nuevo') {
                                        localStorage.setItem('estadoCredito', 'pendiente');
                                        localStorage.setItem('motivo', item.motivo);
                                        this._router.navigate(['/personas/estado-solicitud-credito']);
                                        return;
                                    }
                                });
                                if (nuevo) {
                                    this._router.navigate(['/personas/estado-solicitud-credito']);
                                    return;
                                }
                                if (localStorage.getItem('credito') !== null && JSON.parse(localStorage.getItem('credito')).tipoCredito.includes('Pymes')) {
                                    this._router.navigate(['/personas/solucitudCredito']);
                                } else {
                                    this._router.navigate(['/personas/creditos-autonomos/solicitar-credito']);
                                }
                            });
                            console.log(usuario);


                    }

                },
                (error) => {
                    this.error = 'Fallo en la autenticación, vuelva a intentarlo';
                    this.loading = false;
                }
            );
    }

    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------
    abrirModal(modal) {
        this._modalService.open(modal);
    }

    cerrarModal() {
        this._modalService.dismissAll();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

        // Subscribe to config changes
        this._coreConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.coreConfig = config;
            });
    }

    login() {
        this._authenticationService
            .login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data) => {
                    // this._router.navigate([this.returnUrl]);
                    this._router.navigate(['/']);
                },
                (error) => {
                    console.log(error);
                    this.error = 'Fallo en la autenticación, vuelva a intentarlo';
                }
            );
    }

    captchaValidado(evento) {
        this.captcha = true;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        if (this.logginSubs) {
            this.logginSubs.unsubscribe();
        }

        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
