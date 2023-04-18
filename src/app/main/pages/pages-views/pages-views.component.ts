import {Component, OnInit, ViewChild} from '@angular/core';

import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

import {CoreConfigService} from '@core/services/config.service';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {PagesViewsService} from './pages-views.service';
import moment from 'moment';

@Component({
    selector: 'app-pages-views',
    templateUrl: './pages-views.component.html',
    styleUrls: ['./pages-views.component.scss'],
})
export class PagesViewsComponent implements OnInit {
    @ViewChild('mensajeModal') mensajeModal;

    public coreConfig: any;
    public email_code_Form: FormGroup;
    public confir_email_code_Form: FormGroup;
    public submitted = false;
    public mensaje = '';
    public correolanding; // Private
    private _unsubscribeAll: Subject<any>;
    submitted2 = false;
    public productos;

    /**
     * Constructor
     *
     * @param {CoreConfigService} _coreConfigService
     */
    constructor(
        private _coreConfigService: CoreConfigService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _pages_viewsService: PagesViewsService,
        private _modalService: NgbModal
    ) {
        this.listarProductos();

        this._unsubscribeAll = new Subject();

        // Configure the layout
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

    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.email_code_Form = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });

        this.confir_email_code_Form = this._formBuilder.group(
            {
                code: ['', [Validators.required]],
                codeaux: [''],
            },
            {
                validator: [this.codeConfir('code', 'codeaux')],
            }
        );

        // Subscribe to config changes
        /*    this._coreConfigService.config
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((config) => {
            this.coreConfig = config;
          }); */
    }

    codeConfir(code, codeaux: string) {
        return (group: FormGroup) => {
            let Input = group.controls[code];
            let InputAux = group.controls[codeaux];

            if (Input.value !== InputAux.value) {
                return Input.setErrors({
                    code: {
                        valid: false,
                    },
                });
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    get f() {
        return this.email_code_Form.controls;
    }

    get f2() {
        return this.confir_email_code_Form.controls;
    }

    listarProductos() {
        this._pages_viewsService
            .getlistaProductosfree({tipo: 'producto-bienvenido-sm'})
            .subscribe(
                (data) => {
                    this.productos = data.info;
                },
                (error) => {
                    this.mensaje = 'Error al cargar productos';
                    this.abrirModal(this.mensajeModal);
                }
            );
    }

    enviarCodigo() {
        this.submitted = true;

        if (this.email_code_Form.invalid) {
            return;
        }

        this._pages_viewsService
            .guardarEmail({correo: this.email_code_Form.controls.email.value})
            .subscribe(
                (data) => {
                    this.correolanding = data;
                    this.confir_email_code_Form.controls['codeaux'].setValue(data.codigo);
                    this.mensaje = 'Código enviado';
                    this.abrirModal(this.mensajeModal);
                },
                (error) => {
                    this.mensaje = 'El correo no es valido.';
                    this.abrirModal(this.mensajeModal);
                }
            );
    }

    validarCodigo() {
        this.submitted2 = true;

        if (this.correolanding !== undefined) {
            if (
                this.correolanding.codigo ===
                this.confir_email_code_Form.controls.code.value
            ) {
                localStorage.setItem('codigo', moment().add(59, 's').toString());
                this.correolanding.correoValido = true;
                this.correolanding.codigoValido = true;

                this._pages_viewsService.actualizarCorreo(this.correolanding).subscribe(
                    (data) => {
                        this._router.navigate([
                            `/pages/mensajes-productos/${this.correolanding.id}`,
                        ]);
                    },
                    (error) => {
                        this.mensaje = 'Error al enviar código';
                        this.abrirModal(this.mensajeModal);
                    }
                );
            } else {
                this.confir_email_code_Form.controls['code'].setErrors({
                    incorrect: true,
                });
            }
        }
    }

    abrirModal(modal) {
        this._modalService.open(modal);
    }
}
