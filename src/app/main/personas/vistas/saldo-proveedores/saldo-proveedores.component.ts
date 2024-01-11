import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../../../auth/service';
import {takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {Subject} from 'rxjs';
import {RegistroProveedorService} from '../registro-proveedores/registro-proveedor.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PagoProvedorsService} from '../pago-provedors/pago-provedors.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';


pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * COOP
 * PErsonas
 * ESta pantalla sirve para mostrar el saldo de los proveedores
 * Rutas:
 * `${environment.apiUrl}/personas/proveedores/listOne/${data}`
 * `${environment.apiUrl}/corp/pagoProveedores/update/${datos.get('_id')}`,
 */

@Component({
    selector: 'app-saldo-proveedores',
    templateUrl: './saldo-proveedores.component.html',
    styleUrls: ['./saldo-proveedores.component.scss']
})
export class SaldoProveedoresComponent implements OnInit {
    @ViewChild('mensajeModalConfirm') mensajeModalConfirm;
    @ViewChild('mensajeModal') mensajeModal;

    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;
    public proveedor = null;
    public submitted = false;
    public inicio = true;
    public continuar = false;
    public continuarPago = false;
    public resumen = false;
    public documentoFirmaForm: FormGroup;
    public firmaElectronica = new FormData();

    public pdf;
    public mensaje = 'Cargue una firma electrónica válida';
    private descargarDocumento: any;
    private message: any;
    public usuario;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _router: Router,
        private _authenticationService: AuthenticationService,
        private _proveedorService: RegistroProveedorService,
        private activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _pagoProvedorsService: PagoProvedorsService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
        private _coreMenuService: CoreMenuService,
    ) {
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.activatedRoute.params.subscribe(paramsId => {
            this.getOneProveedor(paramsId.proveedor);
        });
    }

    get documentoFirmar() {
        return this.documentoFirmaForm.controls;
    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }

    ngOnInit(): void {
        this._unsubscribeAll = new Subject();

        this._coreConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.coreConfig = config;
            });
        this.documentoFirmaForm = this._formBuilder.group({
            nombreProveedor: ['', []],
            identificacion: ['', []],
            bancoDestino: ['', []],
            numeroCuenta: ['', []],
            valorPagar: ['', []],
            claveFirma: ['', [Validators.required]],
            certificado: ['', [Validators.required, ValidacionesPropias.firmaElectronicaValido]],
        });
    }

    subirImagen(event: any) {
        if (event.target.files && event.target.files[0]) {
            const nuevaImagen = event.target.files[0];
            this.firmaElectronica.delete('certificado');
            this.firmaElectronica.append('certificado', nuevaImagen, nuevaImagen.name);
        }
        console.log('this.pagoProveedor', this.firmaElectronica);
    }

    getOneProveedor(proveedor) {
        this._proveedorService.getOne(proveedor).subscribe((info) => {
            this.proveedor = info;
            this.proveedor.valorPagar = localStorage.getItem('valorPagar');
            this.documentoFirmaForm.patchValue({
                ...info,
                nombreProveedor: info.nombreComercial,
                valorPagar: localStorage.getItem('valorPagar')
            });
            this.createPDF();
        });
    }

    continuarCick() {
        this.inicio = false;
        this.continuar = true;
    }

    continuarCickPago() {
        this.submitted = true;
        if (this.documentoFirmaForm.invalid) {
            console.log('form', this.documentoFirmaForm);
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        this.firmaElectronica.delete('_id');
        this.firmaElectronica.append('_id', localStorage.getItem('idPagoProveedor'));
        this.firmaElectronica.delete('claveFirma');
        this.firmaElectronica.append('claveFirma', this.documentoFirmaForm.get('claveFirma').value);
        this.firmaElectronica.delete('pdf');
        this.firmaElectronica.append('pdf', this.pdf);
        this.firmaElectronica.append('rucEmpresa', this.usuario.persona.empresaInfo.rucEmpresa);
        this._creditosPreAprobadosService.verificarPropietarioFirma(this.firmaElectronica).subscribe((data) => {
            if (data?.message) {
                this.message = data?.message;
                this.abrirModal(this.mensajeModalConfirm);
            } else {
                this._pagoProvedorsService.actualizarCredito(this.firmaElectronica)
                    .subscribe((info) => {
                            console.log('guardado', info);
                            this.continuar = false;
                            this.continuarPago = true;
                        },
                        error => {
                            this.abrirModal(this.mensajeModal);
                        }
                    );
            }
        });
    }

    continuarClickResumen() {
        this.continuarPago = false;
        this.resumen = true;
        this.descargarDocumento.download('comprobante.pdf');
    }

    logout() {
        this._authenticationService.logout();
        this._router.navigate(['/grp/login']);
    }

    createPDF() {
        const pdfDefinition: any = {
            content: [
                {
                    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAEMCAMAAABgN2xrAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJZQTFRFAEZs+tcAg6W2wdLbPHeR/OFb/fXL8PT2AFJ14OntorvJYY6kAl9/0d7kJWqIcpmtkrHAssfST4Kb/OuV+tol//zy/fCw/vfY/vrl/OZ5+99M+9w6/emH/ORq/O6j/fK+jsvvYrrpP2R27+/vAHTT7fb8AEJkAD1eUH6UAH3W0dXXQFtpAClBtd30YoCQoKCgIark////FUu+jQAAADJ0Uk5T/////////////////////////////////////////////////////////////////wANUJjvAAAm5klEQVR42uydh3bzuradaYASe1WxZbVzknuTW5Po/V8u7ESlSIpUoeccY+/ftiQQpPBhLSwsAMYNgqDFy8AjgCCADkEQQIcgCKBDEATQIQgC6BAEAXQIggA6BEEAHYIAOgRBAB2CIIAOQRBAhyAIoEMQBNAhCALoEAQBdAgC6BAEAXQIggA6BEEAHYIggA5BEECHIAigQxAE0CEIoEMQBNAhCALoEAQBdAiCADoEQQAdgiCADkEQQIcgCKBDEECHIAigQxAE0CEIAugQBAF0CIIAOgRBAB2CIIAOQQAdgiCADkEQQIcgCKBDEATQIQgC6BAEfRro3+v9htH6B98D9JFan7df3fpdnTf79V8DfbfeHFZb9fPY7L/RcKBP0s/qq69+D/ufPwL69+VwvPc4VqfrDu0H+gx9b78G6feyWzrou/19yJvHsYFlhz5Bv1+DdfhZMOi7/Xng49ge1mhG0Jtr/zVGh91CQR9MeanjCRE6aGZRSkkPTWfQCyt2XSDoP6ft12it9miK0CyyKElDo680bXt0wz4sDfS13pivVqtTMbV2WK30PePxgtAcNLkdj/oznstUF3Mdb8J+d0sCfa2ce/g9b9ZysG193ZyV0brtBqhDEyrwbGOgInVJm6+PIt14IuarzbrrBnfXjcK4by9ondBEHrvrG8PlqgtbPQD612ohoMuZBNtDrxny3fUgjeqPVzRRaALMiW2MUaAubvsI6F+bJYC+O8mUD/i4zPoKEXjoUbnjMNfF4r6/HtP354N+FUbbv/vBI5Lr+dUdILSwsXk4EnNdLG7/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',
                    width: 350,
                    height: 150,
                    margin: [100, 2, 100, 50]
                },
                {
                    text: `Nombre del proveedor: ${this.documentoFirmaForm.get('nombreProveedor').value}`,
                },
                {
                    text: `Ruc proveedor: ${this.documentoFirmaForm.get('identificacion').value}`,
                },
                {
                    text: `Banco destino: ${this.proveedor?.cuentas[0].banco}`,
                },
                {
                    text: `Número de cuenta del proveedor: ${this.proveedor?.cuentas[0].cuenta}`,
                },
                {
                    text: `Valor a pagar al proveedor: ${this.documentoFirmaForm.get('valorPagar').value}`,
                }
            ],
            footer: {
                image: 'data:image/jpeg;base64,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',
                width: 100,
                alignment: 'center',
            }
        };

        const pdf = pdfMake.createPdf(pdfDefinition);
        this.descargarDocumento = pdf;
        pdf.getBlob((data: any) => {
            this.pdf = data;
        });
    }

}
