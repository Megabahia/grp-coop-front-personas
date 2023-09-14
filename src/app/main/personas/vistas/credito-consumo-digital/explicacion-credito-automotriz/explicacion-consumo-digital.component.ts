import {Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {takeUntil} from 'rxjs/operators';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {CoreConfigService} from '../../../../../../@core/services/config.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ParametrizacionesService} from '../../../servicios/parametrizaciones.service';

@Component({
    selector: 'app-explicacion-credito-consumo-digital',
    template: `
        <div class="content-wrapper bg-white">
            <div class="card-body text-center">
                <img src="/assets/images/logo/san-jose-v.png" alt="brand-logo" width="300"/>

            </div>
            <div class="content-body">
                <!-- users list start -->
                <div class="text-center mt-1 azul2  text-bold mb-3">
                    <div class="col-md-12 text-center">
                        <h2 class="card-title azul2  text-bold ">
                            Está en el paso 2 de 3
                        </h2>
                        <h4 class="card-title azul2  text-bold ">COMPLETE SUS DATOS</h4>
                    </div>
                </div>
                <section class="app-ecommerce-details">

                    <div class="row">
                        <div class="col-md-12 col-sm-12">
                            <div class="card">
                                <div class="m-2">
                                    <ul class="list-group">
                                        <li class="list-group-item" *ngFor="let item of requisitos?.config">
                                            <img src="assets/images/flecha.png" width="50px" style="float: left; margin-right: 10px;">
                                            <div [innerHTML]="item"></div>
                                        </li>
                                    </ul>
                                </div>
                                <div class="card-footer text-center p-2">
                                    <a href="javascript:void(0)" class="btn btn-primary"
                                       style="color: black !important;"
                                       (click)="continuar()">Continuar</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <!-- users list ends -->
            </div>
        </div>

        <!-- Buynow Button-->
        <app-need-help [href]="'https://walink.co/9e8a9d'"></app-need-help>
    `,
    styleUrls: ['./explicacion-consumo-digital.component.scss']
})
export class ExplicacionConsumoDigitalComponent implements OnInit, OnDestroy {
    @Output() estado = new EventEmitter<number>();

    @ViewChild('startDatePicker') startDatePicker;
    @ViewChild('whatsapp') whatsapp;
    public error;
    // public informacion: CompletarPerfil;
    public coreConfig: any;
    public imagen;
    public registerForm: FormGroup;
    public loading = false;
    public submitted = false;
    // public usuario: User;
    public startDateOptions: FlatpickrOptions = {
        altInput: true,
        mode: 'single',
        altFormat: 'Y-n-j',
        altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    };
    public codigo;
    public fecha;
    // Private
    private _unsubscribeAll: Subject<any>;
    public requisitos;

    constructor(
        private _coreConfigService: CoreConfigService,
        private sanitizer: DomSanitizer,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private modalService: NgbModal,
        private paramService: ParametrizacionesService,
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
        const cuotaMensual = localStorage.getItem('coutaMensual');
        const montoCreditoFinal = localStorage.getItem('montoCreditoFinal');
        this.paramService.obtenerListaPadresSinToken('CREDITO_CONSUMO_DIGITAL_DESCRIPCION_VIDEO_INFORMATIVO').subscribe((info) => {
            this.requisitos = info[0];
            this.requisitos.config = this.requisitos.config.map(item => {
                return item.replace('${{montoCreditoFinal}}', montoCreditoFinal)
                    .replace('${{cuotaMensual}}', cuotaMensual);
            });
        });
    }

    continuar() {
        console.log('estado');
        this.estado.emit(2);
    }

    get f() {
        return this.registerForm.controls;
    }

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            identificacion: ['', [Validators.required]],
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            genero: ['', Validators.required],
            fechaNacimiento: ['string', Validators.required],
            edad: ['', Validators.required],
            whatsapp: ['', Validators.required],
        });
        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
