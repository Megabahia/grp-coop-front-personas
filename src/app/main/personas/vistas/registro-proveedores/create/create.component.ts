import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RegistroProveedorService} from '../registro-proveedor.service';
import {ParametrizacionesService} from '../../../servicios/parametrizaciones.service';
import {ValidacionesPropias} from '../../../../../../utils/customer.validators';
import {ToastrService} from 'ngx-toastr';
import {CoreMenuService} from '../../../../../../@core/components/core-menu/core-menu.service';
import {User} from '../../../../../auth/models';

/**
 * COOP
 * PErsonas
 * Esta pantalla sirve para crear un proveedor
 * Rutas:
 * `${environment.apiUrl}/central/param/list/tipo/todos/`,
 * `${environment.apiUrl}/personas/proveedores/create/`,
 * `${environment.apiUrl}/personas/proveedores/update/${id}`,
 */

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

    @Output() pantalla = new EventEmitter<number>();
    @Input() proveedorPadre;

    public proveedorForm: FormGroup;
    public submitted = false;
    public bancos = [];
    public tipoCuentas = [];
    private usuario: User;

    constructor(
        private _formBuilder: FormBuilder,
        private _proveedorService: RegistroProveedorService,
        private paramService: ParametrizacionesService,
        private toastr: ToastrService,
        private _coreMenuService: CoreMenuService,
    ) {
        this.usuario = this._coreMenuService.grpPersonasUser;
    }

    ngOnInit(): void {
        this.proveedorForm = this._formBuilder.group({
            _id: [''],
            tipoPersona: ['', [Validators.required]],
            identificacion: ['', [Validators.required, ValidacionesPropias.rucValido]],
            nombreRepresentante: ['', [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+')]],
            nombreComercial: ['', [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.\\s]+')]],
            cuentas: this._formBuilder.array([], Validators.required),
            user_id: [this.usuario.id],
        });
        this.proveedorPadre?.cuentas.forEach(item => this.agregarCuenta());
        this.proveedorForm.patchValue({...this.proveedorPadre});
        this.obtenerBancos();
    }

    get proveedor() {
        return this.proveedorForm.controls;
    }

    get cuentas() {
        return this.proveedorForm.controls['cuentas'] as FormArray;
    }

    obtenerBancos() {
        this.paramService.obtenerListaPadres('BANCOS').subscribe((info) => {
            this.bancos = info;
        });
        this.paramService.obtenerListaPadres('TIPO_CUENTA').subscribe((info) => {
            this.tipoCuentas = info;
        });
    }

    agregarCuenta() {
        const cuentaForm = this._formBuilder.group({
            tipoCuenta: ['', [Validators.required]],
            banco: ['', [Validators.required]],
            cuenta: ['', [Validators.required]],
            titular: ['', [Validators.required]]
        });
        this.cuentas.push(cuentaForm);
    }

    deleteCuenta(index: number) {
        this.cuentas.removeAt(index);
    }

    guardar() {
        this.submitted = true;
        if (this.proveedorForm.invalid) {
            console.log('form', this.proveedorForm);
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        if (this.proveedorForm.get('_id').value === '') {
            this._proveedorService.create(this.proveedorForm.value).subscribe(info => {
                this.pantalla.emit(0);
            });
        } else {
            this._proveedorService.update(this.proveedorForm.get('_id').value, this.proveedorForm.value).subscribe(info => {
                this.pantalla.emit(0);
            });
        }
    }

    cancelar() {
        this.pantalla.emit(0);
    }

}
