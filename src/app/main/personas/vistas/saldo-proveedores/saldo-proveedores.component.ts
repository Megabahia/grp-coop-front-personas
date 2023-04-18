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

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-saldo-proveedores',
    templateUrl: './saldo-proveedores.component.html',
    styleUrls: ['./saldo-proveedores.component.scss']
})
export class SaldoProveedoresComponent implements OnInit {
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

    constructor(
        private _coreConfigService: CoreConfigService,
        private _router: Router,
        private _authenticationService: AuthenticationService,
        private _proveedorService: RegistroProveedorService,
        private activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _pagoProvedorsService: PagoProvedorsService,
        private modalService: NgbModal,
    ) {
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
            this.documentoFirmaForm.patchValue({...info, valorPagar: localStorage.getItem('valorPagar')});
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
            return;
        }
        this.firmaElectronica.delete('_id');
        this.firmaElectronica.append('_id', localStorage.getItem('idPagoProveedor'));
        this.firmaElectronica.delete('claveFirma');
        this.firmaElectronica.append('claveFirma', this.documentoFirmaForm.get('claveFirma').value);
        this.firmaElectronica.delete('pdf');
        this.firmaElectronica.append('pdf', this.pdf);
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

    continuarClickResumen() {
        this.continuarPago = false;
        this.resumen = true;
    }

    logout() {
        this._authenticationService.logout();
        this._router.navigate(['/grp/login']);
    }

    createPDF() {
        const pdfDefinition: any = {
            content: [
                {
                    text: `Nombre proveedor: ${this.documentoFirmaForm.get('nombreProveedor').value}`,
                },
                {
                    text: `Ruc proveedor: ${this.documentoFirmaForm.get('identificacion').value}`,
                },
                {
                    text: `Banco: ${this.proveedor?.cuentas[0].banco}`,
                },
                {
                    text: `Numero cuenta: ${this.proveedor?.cuentas[0].cuenta}`,
                },
                {
                    text: `Valor pagar: ${this.documentoFirmaForm.get('valorPagar').value}`,
                }
            ]
        };

        const pdf = pdfMake.createPdf(pdfDefinition);
        pdf.getBlob((data: any) => {
            this.pdf = data;
        });
    }

}
