import {Component, OnInit, TemplateRef} from '@angular/core';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {ConfirmacionGaranteService} from './confirmacion-garante.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-confirmacion-garante',
    templateUrl: './confirmacion-garante.component.html',
    styleUrls: ['./confirmacion-garante.component.scss']
})
export class ConfirmacionGaranteComponent implements OnInit {

    public autorizacion = false;
    public garanteNegocio = false;
    public credito;
    public creditoId = '';

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private modalService: NgbModal,
        private _coreConfigService: CoreConfigService,
        private _confirmacionService: ConfirmacionGaranteService,
        private router: Router
    ) {
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
        this.creditoId = this._route.snapshot.paramMap.get('id');
    }

    ngOnInit(): void {
        this._confirmacionService.getOneCreditoPersona({_id: this.creditoId, tipoCredito: 'null'}).subscribe((data) => {
                this.credito = data;
            },
            error => {
                this._router.navigate(['/grp/login']);
            });
    }

    confirmarGarante(event: Event, modal: any) {
        if (!this.autorizacion) {
            return;
        }
        this._confirmacionService.updateCreditoPersona({
            _id: this.creditoId, tipoCredito: this.credito.canal, concepto: this.credito.concepto, canal: this.credito.canal
        }).subscribe((data) => {
            if (data) {
                this.credito = data;
                console.log(data);
                console.log('si hay');
            }
        });
        event.preventDefault();
        this.modalService.open(modal, {
            size: 'lg'
        });
    }

    redcredicompra() {
        window.location.href = 'https://credicompra.com/';
        this.cerrarModal();
    }

    mostrarTerminos(event: Event, modal: any) {
        event.preventDefault();
        this.modalService.open(modal, {
            size: 'lg'
        });
    }

    abrirModal(modal) {
        this.modalService.open(modal);
    }
    cerrarModal() {
        this.modalService.dismissAll();
    }

}


