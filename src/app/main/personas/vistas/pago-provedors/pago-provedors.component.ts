import {Component, OnInit} from '@angular/core';
import {RegistroProveedorService} from '../registro-proveedores/registro-proveedor.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../../../auth/service';
import {PagoProvedorsService} from './pago-provedors.service';
import {log} from 'util';

@Component({
    selector: 'app-pago-provedors',
    templateUrl: './pago-provedors.component.html',
    styleUrls: ['./pago-provedors.component.scss']
})
export class PagoProvedorsComponent implements OnInit {

    public pagoFacturaForm: FormGroup;
    public submitted = false;
    public proveedores = [];
    public pagoProveedor = new FormData();
    private proveedor;

    constructor(
        private _router: Router,
        private _authenticationService: AuthenticationService,
        private _pagoProvedorsService: PagoProvedorsService,
        private _formBuilder: FormBuilder,
        private _proveedorService: RegistroProveedorService,
    ) {
    }

    get pagoFactura() {
        return this.pagoFacturaForm.controls;
    }

    ngOnInit(): void {
        this.pagoFacturaForm = this._formBuilder.group({
            _id: [''],
            valorPagar: ['', [Validators.required]],
            proveedor: ['', [Validators.required]],
            factura: ['', [Validators.required]],
        });
        this.obtenerProveedores();
    }

    obtenerProveedores() {
        this._proveedorService.list({
            page: 0, page_size: 10
        }).subscribe(info => {
            this.proveedores = info.info;
        });
    }

    subirImagen(event: any) {
        if (event.target.files && event.target.files[0]) {
            const nuevaImagen = event.target.files[0];
            this.pagoProveedor.delete('factura');
            this.pagoProveedor.append('factura', nuevaImagen, nuevaImagen.name);
        }
        console.log('this.pagoProveedor', this.pagoProveedor);
    }

    getOneProveedor() {
        this._proveedorService.getOne(this.pagoFacturaForm.get('proveedor').value).subscribe((info) => {
            this.proveedor = info;
            console.log('proveedor', this.proveedor);
        });
    }

    pagar() {
        this.submitted = true;
        if (this.pagoFacturaForm.invalid) {
            return;
        }
        const infoEmpresa = JSON.parse(localStorage.getItem('grpPersonasUser')).persona.empresaInfo;
        const persona = JSON.parse(localStorage.getItem('grpPersonasUser')).persona;
        console.log('info ruc', infoEmpresa.rucEmpresa);
        console.log('this.pagoFacturaForm.get(\'valorPagar\').value', this.pagoFacturaForm.get('valorPagar').value);
        this.pagoProveedor.delete('estado');
        this.pagoProveedor.append('estado', 'Pendiente');
        this.pagoProveedor.delete('usuario');
        this.pagoProveedor.append('usuario', JSON.stringify(persona));
        this.pagoProveedor.delete('nombrePyme');
        this.pagoProveedor.append('nombrePyme', infoEmpresa.comercial);
        this.pagoProveedor.delete('numeroCuenta');
        this.pagoProveedor.append('numeroCuenta', this.proveedor.cuentas[0].cuenta);
        this.pagoProveedor.delete('banco');
        this.pagoProveedor.append('banco', this.proveedor.cuentas[0].banco);
        this.pagoProveedor.delete('rucProveedor');
        this.pagoProveedor.append('rucProveedor', this.proveedor.identificacion);
        this.pagoProveedor.delete('nombreProveedor');
        this.pagoProveedor.append('nombreProveedor', this.proveedor.nombreComercial);
        this.pagoProveedor.delete('valorPagar');
        this.pagoProveedor.append('valorPagar', this.pagoFacturaForm.get('valorPagar').value);

        this._pagoProvedorsService.crearSolicitudPagoProveedor(this.pagoProveedor)
            .subscribe((info) => {
                    console.log('guardado', info);
                    localStorage.removeItem('valorPagar');
                    localStorage.setItem('valorPagar', this.pagoFacturaForm.get('valorPagar').value);
                    localStorage.removeItem('idPagoProveedor');
                    localStorage.setItem('idPagoProveedor', info._id);
                    localStorage.removeItem('credito');
                    this._router.navigate([`/personas/saldoDisponible/${this.proveedor.identificacion}`]);
                }
            );
    }

    cancelar() {
        this._authenticationService.logout();
        this._router.navigate(['/grp/login']);
    }

}
