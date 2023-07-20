import {Component, OnInit, ViewChild} from '@angular/core';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {DatePipe} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../@core/services/config.service';


@Component({
    selector: 'app-firmar-documentos-habilitantes',
    templateUrl: './firmar-documentos-habilitantes.component.html',
    styleUrls: ['./firmar-documentos-habilitantes.component.scss'],
    providers: [DatePipe],
})
export class FirmarDocumentosHabilitantesComponent implements OnInit {
    @ViewChild('mensajeModalConfirm') mensajeModalConfirm;

    public message;

    public usuario;
    public documentoAFimar;
    public credito;
    public documentoFirmaForm: FormGroup;
    public submitted = false;
    public firmaElectronica = new FormData();
    private creditSelected;

    // configuracion
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
        private _coreMenuService: CoreMenuService,
        private datePipe: DatePipe,
        private _modalService: NgbModal,
        private _formBuilder: FormBuilder,
        private toastr: ToastrService,
        private _coreConfigService: CoreConfigService,
    ) {
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.documentoFirmaForm = this._formBuilder.group({
            solicitudCreditoFirmado: [''],
            claveFirma: ['', [Validators.required]],
            certificado: ['', [Validators.required, ValidacionesPropias.firmaElectronicaValido]],
        });
        this._unsubscribeAll = new Subject();
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

    ngOnInit(): void {
        this.obtenerCreditos();
    }

    continuarCickPago() {
        this.submitted = true;
        if (this.documentoFirmaForm.invalid) {
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }

        this.firmaElectronica.append('claveFirma', this.documentoFirmaForm.value.claveFirma);
        this.firmaElectronica.append('' + this.documentoAFimar, this.creditSelected.solicitudCredito.slice(40));
        this.firmaElectronica.append('_id', this.creditSelected._id);
        this.firmaElectronica.append('rucEmpresa', this.usuario.persona.empresaInfo.rucEmpresa);
        console.log('data', this.firmaElectronica.get('_id'));
        this._creditosPreAprobadosService.verificarPropietarioFirma(this.firmaElectronica).subscribe((data) => {
                if (data?.message) {
                    this.message = data?.message;
                    this.abrirModal(this.mensajeModalConfirm);
                } else {
                    this._creditosPreAprobadosService.actualizarCredito(this.firmaElectronica).subscribe((info) => {
                            this._modalService.dismissAll();
                            this.obtenerCreditos();
                        }, (error) => {
                            this.message = 'Ocurrió un error al enviar fimar';
                            this.abrirModal(this.mensajeModalConfirm);
                        }
                    );
                }
        });
    }

    abrirModal(modal) {
        this._modalService.open(modal);
    }

    subirImagen(event: any) {
        if (event.target.files && event.target.files[0]) {
            const nuevaImagen = event.target.files[0];
            this.firmaElectronica.delete('certificado');
            this.firmaElectronica.append('certificado', nuevaImagen);
        }
    }

    get documentoFirmar() {
        return this.documentoFirmaForm.controls;
    }

    transformarFecha(fecha) {
        return this.datePipe.transform(fecha, 'yyyy-MM-dd');
    }

    obtenerCreditos() {
        this._creditosPreAprobadosService.obtenerListaCreditos({
            page: 0,
            page_size: 10,
            estado: 'Aprobado',
            user_id: this.usuario.id
        }).subscribe((info) => {
            this.credito = info.info[0];
            if (this.credito.solicitudCreditoFirmado && this.credito.pagareFirmado &&
                this.credito.contratosCuentaFirmado && this.credito.tablaAmortizacionFirmado) {
                this._coreConfigService.config = {
                    layout: {
                        navbar: {
                            hidden: false,
                        },
                        footer: {
                            hidden: false,
                        },
                        menu: {
                            hidden: false,
                        },
                        customizer: false,
                        enableLocalStorage: false,
                    },
                };
                this._coreMenuService.grpPersonasUser.documentosFirmados = 1;
                localStorage.setItem('grpPersonasUser', JSON.stringify(this._coreMenuService.grpPersonasUser));
            }
            console.log(info);
        });
    }

    modalOpenSM(modalSM, credito, docFirmado) {
        this.documentoFirmaForm = this._formBuilder.group({
            solicitudCreditoFirmado: [''],
            claveFirma: ['', [Validators.required]],
            certificado: ['', [Validators.required, ValidacionesPropias.firmaElectronicaValido]],
        });
        this.firmaElectronica = new FormData();
        this.documentoAFimar = docFirmado;
        console.log('pagareFirmado', docFirmado);
        console.log('credito', credito);
        this.creditSelected = credito;
        this._modalService.open(modalSM, {
            centered: true,
            size: 'lg' // size: 'xs' | 'sm' | 'lg' | 'xl'
        });
    }
}
