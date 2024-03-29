import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MicroCreditosService} from '../micro-creditos.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

/**
 * COOP
 * PErsonas
 * ESta pantalla sirve verificar el credito preaprobado
 * Rutas:
 * `${environment.apiUrl}/corp/creditoPersonas/creditoPreaprobado/codigo`,
 */

@Component({
    selector: 'app-creditos-preaprobados',
    templateUrl: './creditos-preaprobados.component.html',
    styleUrls: ['./creditos-preaprobados.component.scss']
})
export class CreditosPreaprobadosComponent implements OnInit {

    public submitted = false;
    public validarForm: FormGroup;

    constructor(
        private _formBuilder: FormBuilder,
        private _microCreditosServicios: MicroCreditosService,
        private _router: Router,
        private toastr: ToastrService,
    ) {

    }

    get f() {
        return this.validarForm.controls;
    }

    ngOnInit(): void {
        this.validarForm = this._formBuilder.group({
            rucEmpresa: ['', [Validators.required]],
            codigo: ['', [Validators.required]],
        });
    }

    validarCodigo() {
        this.submitted = true;
        if (this.validarForm.invalid) {
            this.toastr.warning('Al parecer existe un error con la información que ingresó, por favor revise y vuelva a intentar.',
                'Alerta');
            return;
        }
        this._microCreditosServicios.compararCodigo(this.validarForm.value).subscribe(info => {
                localStorage.setItem('credito', JSON.stringify(info));
                this._router.navigate(['/personas/solucitudCredito']);
            },
            (error) => {
                alert('Usted no tiene un credito');
            }
        );
    }

}
