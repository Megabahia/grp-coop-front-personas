import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import {FirmaElectronicaService} from './firma-electronica.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {User} from '../../../../auth/models';
import {CreditosPreAprobadosService} from '../creditos-pre-aprobados/creditos-pre-aprobados.service';

/**
 * COOP
 * PErsonas
 * Esta pantalla sirve para registrar la informacion de la firma electronica
 * Rutas:
 * `${environment.apiUrl}/corp/firmaElectronica/create/`,
 */

@Component({
    selector: 'app-registro-firma-electronica',
    templateUrl: './registro-firma-electronica.component.html',
    styleUrls: ['./registro-firma-electronica.component.scss']
})
export class RegistroFirmaElectronicaComponent implements OnInit {
    @ViewChild('mensajeModal') mensajeModal;

    public firmaForm: FormGroup;
    public submitted = false;
    public mensaje = 'Su información ha sido almacenada con éxito.';

    // configuracion
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;
    public usuario: User;
    private representante = '';

    constructor(
        private _coreMenuService: CoreMenuService,
        private _formBuilder: FormBuilder,
        private _firmaElectronica: FirmaElectronicaService,
        private modalService: NgbModal,
        private _router: Router,
        private toastr: ToastrService,
        private _coreConfigService: CoreConfigService,
        private _creditosPreAprobadosService: CreditosPreAprobadosService,
    ) {
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
        this.usuario = this._coreMenuService.grpPersonasUser;
        this._creditosPreAprobadosService.obtenerListaCreditos({
            page: 0,
            page_size: 10,
            user_id: this.usuario.id
        }).subscribe((info) => {
            this.representante = info.info[0]?.empresaInfo;
            this.firmaForm.patchValue({
                nombreRepresentante: this.representante?.['reprsentante'],
                apellidoRepresentante: this.representante?.['reprsentante'],
                correoRepresentante: this.representante?.['correo'],
                telefonoRepresentante: this.representante?.['telefono'],
                whatsappRepresentante: this.representante?.['whatsapp'],
                tipoIdentificacionRepresentante: 'Ruc',
                identificacionRepresentante: this.representante?.['rucEmpresa'],
            });
            console.log('representante', this.representante);
        });
    }

    ngOnInit(): void {
        this.firmaForm = this._formBuilder.group(
            {
                aceptarTerminos: ['', [Validators.required, Validators.requiredTrue]],
                nombreRepresentante: ['', [Validators.required]],
                apellidoRepresentante: ['', [Validators.required]],
                correoRepresentante: ['', [Validators.required, Validators.email]],
                telefonoRepresentante: ['', [
                    Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]
                ],
                whatsappRepresentante: ['', [
                    Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]
                ],
                tipoIdentificacionRepresentante: ['', [Validators.required]],
                identificacionRepresentante: ['', [Validators.required]],
            });
    }

    get firmaElectronica() {
        return this.firmaForm.controls;
    }

    obtenerTipoIdentificacion() {
        if (this.firmaForm.get('tipoIdentificacionRepresentante').value === 'cedula') {
            (this.firmaForm as FormGroup)
                .setControl('identificacionRepresentante',
                    new FormControl(this.firmaForm.value.identificacionRepresentante,
                        [Validators.required, ValidacionesPropias.cedulaValido])
                );
        } else {
            (this.firmaForm as FormGroup)
                .setControl('identificacionRepresentante',
                    new FormControl(this.firmaForm.value.identificacionRepresentante,
                        [Validators.required, ValidacionesPropias.rucValido])
                );
        }
    }

    guardar() {
        this.submitted = true;
        if (this.firmaForm.invalid) {
            console.log('form', this.firmaForm);
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        this._firmaElectronica.crear(this.firmaForm.value).subscribe((info) => {
            this._coreMenuService.grpPersonasUser.persona = {...this.usuario.persona, ...this.firmaForm.value};
            localStorage.setItem('grpPersonasUser', JSON.stringify(this._coreMenuService.grpPersonasUser));
            this.abrirModal(this.mensajeModal);
        });
        console.log('paso');
    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }

    cerrarModal() {
        this.modalService.dismissAll();
        this._router.navigate(['/personas/firmar-documentos']);
    }
}
