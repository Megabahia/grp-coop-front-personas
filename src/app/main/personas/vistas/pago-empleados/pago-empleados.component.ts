import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {PagoEmpleadosService} from './pago-empleados.service';
import {CoreSidebarService} from '../../../../../@core/components/core-sidebar/core-sidebar.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import {jsPDF} from 'jspdf';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';

/**
 * COOP
 * Personas
 * ESta pantalla sirve para pagar a los personas
 * Rutas:
 * `${environment.apiUrl}/personas/proveedores/list/`,
 * `${environment.apiUrl}/personas/proveedores/listOne/${data}`
 * `${environment.apiUrl}/corp/pagoProveedores/create/`,
 */

@Component({
    selector: 'app-pago-empleados',
    templateUrl: './pago-empleados.component.html',
    styleUrls: ['./pago-empleados.component.scss'],
    providers: [DatePipe]
})
export class PagoEmpleadosComponent implements OnInit, AfterViewInit {
    @ViewChild('mensajeModalConfirm') mensajeModalConfirm;
    @ViewChild(NgbPagination) paginator: NgbPagination;
    @ViewChild('negarMdl') negarMdl;
    @ViewChild('procesarMdl') procesarMdl;
    @ViewChild('firmarMdl') firmarMdl;

    // public
    public page = 1;
    public page_size: any = 4;
    public maxSize;
    public collectionSize;

    public listaPagoEmpleados = [];
    public usuario;
    public observacion = '';
    public idPagoEmpleado = '';
    private solicitudPago;
    public empleadoForm: FormGroup;
    public pagosEmpleadoSubmitted = false;
    imagen: any = '';
    private pagoEmpleadoFormData: any = new FormData();
    cargando: any;
    pagoSubmitted = false;
    public documentoFirmaForm: FormGroup;
    submitted = false;
    public monto = '';
    public empleado = '';
    public firmarFormData = new FormData();
    public message: any;

    constructor(
        private _coreSidebarService: CoreSidebarService,
        private _pagoEmpleadosService: PagoEmpleadosService,
        private datePipe: DatePipe,
        private _coreMenuService: CoreMenuService,
        private _modalService: NgbModal,
        private _formBuilder: FormBuilder,
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
    ) {
        this.empleadoForm = this._formBuilder.group({
            _id: ['', []],
            nombresCompletos: ['', [Validators.required]],
            cedula: ['', [Validators.required]],
            celular: ['', [Validators.required]],
            correo: ['', [Validators.required]],
            montoPagar: ['', [Validators.required]],
            codigoEmpleado: ['', [Validators.required]],
            numeroCuentaEmpleado: ['', [Validators.required]],
            bancoDestino: ['', [Validators.required]],
            mesPago: ['', [Validators.required]],
            anio: ['', [Validators.required]],
            estado: ['', [Validators.required]],
        });
        this.documentoFirmaForm = this._formBuilder.group({
            solicitudCreditoFirmado: [''],
            claveFirma: ['', [Validators.required]],
            certificado: ['', [Validators.required, ValidacionesPropias.firmaElectronicaValido]],
        });
    }

    get empForm() {
        return this.empleadoForm.controls;
    }

    get documentoFirmar() {
        return this.documentoFirmaForm.controls;
    }

    ngOnInit(): void {
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.obtenerPagosEmpleados();
    }

    ngAfterViewInit() {
        this.iniciarPaginador();
    }

    iniciarPaginador() {
        this.paginator.pageChange.subscribe(() => {
            this.obtenerPagosEmpleados();
        });
    }

    obtenerPagosEmpleados() {
        this._pagoEmpleadosService.listarPagoEmpleados({
            page_size: this.page_size, page: this.page - 1,
            user_id: this.usuario.id
        }).subscribe((info) => {
            this.collectionSize = info.cont;
            this.listaPagoEmpleados = info.info;
        });
    }

    seguroNegarModal(id) {
        this.idPagoEmpleado = id;
        this.observacion = '';
        this.abrirModal(this.negarMdl);
    }

    enviarNegar() {
        this._pagoEmpleadosService.actualizarPagoEmpleados({
            _id: this.idPagoEmpleado,
            state: 0
        })
            .subscribe((info) => {
                this.obtenerPagosEmpleados();
                this._modalService.dismissAll();
            });
    }


    enviarFirmar() {
        const doc = new jsPDF();

        const text = `Documento generado de COMPROBANTE DE PAGO`;

        const x = 10;
        const y = 10;
        const maxWidth = 180; // Ancho máximo del párrafo

        doc.text(text, x, y, {maxWidth});

        // Convierte el documento en un archivo Blob
        const pdfBlob = doc.output('blob');
        this.firmarFormData.delete('archivoFirmado');
        this.firmarFormData.append('archivoFirmado', pdfBlob, `${Date.now()}_comprobantePago`);
        this.firmarFormData.delete('claveFirma');
        this.firmarFormData.append('claveFirma', this.documentoFirmaForm.value.claveFirma);
        this.firmarFormData.append('rucEmpresa', this.usuario.persona.empresaInfo.rucEmpresa);
        this.firmarFormData.delete('estado');
        this.firmarFormData.append('estado', 'Activo');
        this.firmarFormData.delete('usuarioEmpresa');
        this.firmarFormData.append('usuarioEmpresa', JSON.stringify(this.usuario.persona));
        this._creditosPreAprobadosService.verificarPropietarioFirma(this.firmarFormData).subscribe((data) => {
            if (data?.message) {
                this.message = data?.message;
                this.abrirModal(this.mensajeModalConfirm);
            } else {
                this._pagoEmpleadosService.firmarPagoEmpleados(this.firmarFormData).subscribe((info) => {
                    console.log('info', info);
                    this.cerrarModal();
                    const fileUrl = info.archivoFirmado;
                    const downloadLink = document.createElement('a');
                    downloadLink.href = fileUrl;
                    // downloadLink.target = '_blank'; // Abre el enlace en una nueva pestaña
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }, (error) => {
                    console.log('error', error);
                });
            }
        }, (error) => {
            this.message = '¡Lo sentimos! \n' +
                'La clave de la firma electrónica ingresada es incorrecta. Verifique y vuelva a intentar.\n';
            this.abrirModal(this.mensajeModalConfirm);
        });
    }

    getUsuario(usuario, atributo) {
        return usuario.cliente?.[atributo];
    }

    fechaActual() {
        return this.datePipe.transform(new Date(), 'yyyy-MM-dd hh:mm:ss');
    }

    procesarPago(pago, pagoEmpleado) {
        this.firmarFormData = new FormData();
        this.firmarFormData.delete('_id');
        this.firmarFormData.append('_id', pagoEmpleado._id);
        this.firmarFormData.delete('usuarioEmpresa');
        this.firmarFormData.append('usuarioEmpresa', JSON.stringify(this.usuario.persona));
        this.idPagoEmpleado = pago._id;
        this.solicitudPago = pago;
        this.monto = pagoEmpleado.montoPagar;
        this.empleado = pagoEmpleado.nombresCompletos;
        this.abrirModal(pago);
    }

    transformarFecha(fecha) {
        return this.datePipe.transform(fecha, 'yyyy-MM-dd');
    }

    transformarObjecto(usuario, atributo) {
        return JSON.parse(usuario)[atributo];
    }

    abrirModal(modal) {
        this._modalService.open(modal);
    }

    toggleSidebar(name, id): void {
        this.pagosEmpleadoSubmitted = false;
        this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
    }

    toggleSidebarEmpleado(name, pagoEmpleado): void {
        this.pagosEmpleadoSubmitted = false;
        this.empleadoForm.patchValue(pagoEmpleado);
        this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
    }

    subirArchivo() {
        this.pagosEmpleadoSubmitted = true;
        if (!this.imagen && this.pagosEmpleadoSubmitted) {
            return;
        }
        console.log('paso if');
        this.cargando = true;
        this._pagoEmpleadosService.subirArchivoPagoEmpleados(this.pagoEmpleadoFormData).subscribe((info) => {
                this.obtenerPagosEmpleados();
                // this.mensaje = 'Empresa guardada con éxito';
                // this.abrirModal(this.mensajeModal);
                this.toggleSidebar('guardarEmpresa', '');
                this.cargando = false;

            },
            (error) => {
                const errores = Object.values(error);
                const llaves = Object.keys(error);
                // this.mensaje = 'Error al crear empresa';
                // this.abrirModal(this.mensajeModal);
                this.cargando = false;
            });
    }

    subirImagen(event) {
        this.pagoEmpleadoFormData = new FormData();
        if (event.target.files && event.target.files[0]) {
            const imagen = event.target.files[0];
            this.imagen = imagen.name;
            this.pagoEmpleadoFormData.delete('documento');
            this.pagoEmpleadoFormData.append('documento', imagen, Date.now() + '_' + imagen.name);
            this.pagoEmpleadoFormData.delete('user_id');
            this.pagoEmpleadoFormData.append('user_id', this.usuario.id);
        }
    }

    subirDocumento(event) {
        if (event.target.files && event.target.files[0]) {
            const imagen = event.target.files[0];
            this.imagen = imagen.name;
            this.firmarFormData.delete('certificado');
            this.firmarFormData.append('certificado', imagen, `${Date.now()}_${imagen.name}`);
        }
    }

    actualizarPago() {
        this.pagoSubmitted = true;
        if (this.empleadoForm.invalid) {
            return;
        }
        this._pagoEmpleadosService.actualizarPagoEmpleados(this.empleadoForm.value).subscribe((info) => {
            this.obtenerPagosEmpleados();
            this._coreSidebarService.getSidebarRegistry('editarPagoEmpleado').close();
        });
    }

    cerrarModal() {
        this._modalService.dismissAll();
    }
}
