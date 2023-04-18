import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CoreConfigService} from '@core/services/config.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {RecuperarPassService} from './recuperar-pass.service';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-recuperar-pass',
    templateUrl: './recuperar-pass.component.html',
    styleUrls: ['./recuperar-pass.component.scss']
})
export class RecuperarPassComponent implements OnInit {
    @ViewChild('mensajeModalConfirm') mensajeModalConfirm;

    // Public
    public emailVar;
    public coreConfig: any;
    public forgotPasswordForm: FormGroup;
    public submitted = false;
    public data;
    public mensaje = '';
    public error;
    // Private
    private _unsubscribeAll: Subject<any>;
    public captcha: boolean;
    public siteKey: string;

    /**
     * Constructor
     *
     * @param {CoreConfigService} _coreConfigService
     * @param {FormBuilder} _formBuilder
     *
     */
    constructor(
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _recuperarPassService: RecuperarPassService,
        private _modalService: NgbModal,
    ) {
        this.siteKey = '6Lewc_MgAAAAADbbRC1OjtcpEreTMKro2GqRsl_L';
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
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });

        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    redirigir() {
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }

    /**
     * On destroy
     */

    resetearPassword() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.forgotPasswordForm.invalid || !this.captcha) {
            return;
        }
        this._recuperarPassService.recuperarPassword(this.f.email.value).subscribe((info) => {
                this.error = null;
                if (info.status) {
                    this.mensaje = 'Revise su correo para cambiar su contraseña';
                    this.abrirModal(this.mensajeModalConfirm);
                }
            },
            (error) => {
                this.error = 'Ocurrió un error al enviar su correo';
            });
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
