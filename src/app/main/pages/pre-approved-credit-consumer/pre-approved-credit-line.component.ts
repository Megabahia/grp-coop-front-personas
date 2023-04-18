import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import Decimal from 'decimal.js';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {PreArpovedCreditLineService} from './pre-arpoved-credit-line.service';

@Component({
    selector: 'app-pre-approved-credit-line',
    templateUrl: './pre-approved-credit-line.component.html',
    styleUrls: ['./pre-approved-credit-line.component.scss']
})
export class PreApprovedCreditLineComponent implements OnInit {
    public envioForm: FormGroup;
    public submittedSimulador = false;
    public pathSent;
    @ViewChild('mensajeModal') mensajeModal;
    public mensaje = '';
    public coreConfig: any;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _preArpovedCreditService: PreArpovedCreditLineService,
        private modalService: NgbModal,
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
            return;
        }
        const code = this.envioForm.value.code.toString();
        const document = this.envioForm.value.document.toString();
        //    ingresar if de validación antes de redireccionar
        localStorage.setItem('preApproved', 'true');
        this._preArpovedCreditService.validateCredit({'codigo': code, 'cedula': document})
            .subscribe((data: any) => {
                localStorage.setItem('coutaMensual', data.cuota);
                localStorage.setItem('montoCreditoFinal', data.monto);
                localStorage.setItem('tipoPersona', data.tipoPersona);
                localStorage.setItem('estadoCivil', data.estadoCivil);
                localStorage.setItem('simulador', 'ok');
                localStorage.setItem('credito', JSON.stringify(data));
                this._router.navigate([
                    `/pages/preApprovedEndConsumer`], {queryParams: data}
                );
            }, (error: any) => {
                this.mensaje = 'Usted no tiene un Crédito Pre-Aprobado pero puede acceder un a Crédito para realizar su compra';
                this.abrirModal(this.mensajeModal);
            });
    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }

    ngOnInit(): void {
        this.envioForm = this._formBuilder.group({
            document: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.maxLength(13),
                    Validators.minLength(10),
                    Validators.min(1),
                ],
            ],
            code: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.min(1),
                ],
            ],
        });
        // Subscribe to config changes
        this._unsubscribeAll = new Subject();
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    actionContinue() {
        this._router.navigate([
            `/pages/preApprovedEndConsumer`,
        ]);
    }
}
