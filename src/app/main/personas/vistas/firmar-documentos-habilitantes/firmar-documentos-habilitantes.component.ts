import {Component, OnInit, ViewChild} from '@angular/core';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {DatePipe} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';

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

    constructor(
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
        private _coreMenuService: CoreMenuService,
        private datePipe: DatePipe,
        private _modalService: NgbModal,
        private _formBuilder: FormBuilder,
    ) {
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.documentoFirmaForm = this._formBuilder.group({
            solicitudCreditoFirmado: [''],
            claveFirma: ['', [Validators.required]],
            certificado: ['', [Validators.required, ValidacionesPropias.firmaElectronicaValido]],
        });
    }

    ngOnInit(): void {
        this.obtenerCreditos();
    }

    continuarCickPago() {
        this.submitted = true;
        if (this.documentoFirmaForm.invalid) {
            return;
        }

        this.firmaElectronica.append('claveFirma', this.documentoFirmaForm.value.claveFirma);
        this.firmaElectronica.append('' + this.documentoAFimar, this.creditSelected.solicitudCredito.slice(40));
        this.firmaElectronica.append('_id', this.creditSelected._id);
        console.log('data', this.firmaElectronica.get('_id'));
        this._creditosPreAprobadosService.actualizarCredito(this.firmaElectronica).subscribe((info) => {
                this._modalService.dismissAll();
                this.obtenerCreditos();
            }, (error) => {
                this.message = 'Ocurrió un error al enviar fimar';
                this.abrirModal(this.mensajeModalConfirm);
            }
        );
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
        this.creditSelected = credito;
        this._modalService.open(modalSM, {
            centered: true,
            size: 'lg' // size: 'xs' | 'sm' | 'lg' | 'xl'
        });
    }
}
