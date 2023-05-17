import { Component, OnInit, ViewChild } from '@angular/core';
import { CoreConfigService } from '../../../../@core/services/config.service';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Decimal from 'decimal.js';
import { ParametrizacionesService } from '../../personas/servicios/parametrizaciones.service';
import { PreArpovedCreditServiceBp } from './pre-arpoved-credit.service-bp';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-pre-approved-credit',
    templateUrl: './pre-approved-credit.component-bp.html',
    styleUrls: ['../pre-approved-credit.component-bp.scss']
})
export class PreApprovedCreditComponentBp implements OnInit {
    public envioForm: FormGroup;
    public submittedSimulador = false;
    public pathSent;
    @ViewChild('mensajeModal') mensajeModal;
    public mensaje = '';
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _preArpovedCreditService: PreArpovedCreditServiceBp,
        private modalService: NgbModal,
        private toastr: ToastrService,
    ) {
        const ref = document.referrer;
        const host = document.location.host;
        // if (ref !== 'https://credicompra.com/') {
        //     if (host !== '209.145.61.41:4201') {
        //         this._router.navigate([
        //             `/grp/login`,
        //         ]);
        //         localStorage.clear();
        //         return;
        //     }
        // }

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
        this._unsubscribeAll = new Subject();

        this._coreConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.coreConfig = config;
            });
    }

    get getsimuladorForm() {
        return this.envioForm.controls;
    }

    cerrarModal() {
        this.modalService.dismissAll();
    }

    sentCode() {
        this.submittedSimulador = true;
        if (this.envioForm.invalid) {
            this.mensaje = 'Datos Incorrectos';
            this.abrirModal(this.mensajeModal);
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        const code = new Decimal(this.envioForm.value.code).toNumber();
        const document = new Decimal(this.envioForm.value.document).toNumber();
        //    ingresar if de validación antes de redireccionar
        localStorage.setItem('preApproved', 'true');
        this._preArpovedCreditService.validateCredit({'codigo': code, 'cedula': document})
            .subscribe((data: any) => {
                this._router.navigate([
                    `/pages/approvedCredit`], {queryParams: data}
                );
            }, (error: any) => {
                this.mensaje = 'Lo sentimos! <br> Parece que ha ocurrido un error, por favor verifica el código y número de identificación ingresado y vuelve a intentar.';
                this.abrirModal(this.mensajeModal);
            });


    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }

    ngOnInit(): void {
        this.envioForm = this._formBuilder.group({
            code:  [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.min(1),
                ],
            ],
            document:  [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.maxLength(10),
                    Validators.minLength(10),
                    Validators.min(1),
                ],
            ],
        });
    }
    actionContinue() {
        this._router.navigate([
            `/pages/simulador`,
        ]);
        localStorage.setItem('preApproved', 'true');
    }
}
