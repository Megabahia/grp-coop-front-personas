import {Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {takeUntil} from 'rxjs/operators';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {CoreConfigService} from '../../../../../../@core/services/config.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ParametrizacionesService} from '../../../servicios/parametrizaciones.service';

/**
 * COOP
 * Personas
 * Esta pantalla sirve para mostrar los requerimientos
 * Rutas:
 * `${environment.apiUrl}/central/param/list/tipo/todos/free`,
 */


@Component({
    selector: 'app-video-explicativo-aut',
    templateUrl: './video-explicativo.component.html',
    styleUrls: ['./video-explicativo.component.scss']
})
export class VideoExplicativoAutComponent implements OnInit, AfterViewInit, OnDestroy {
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
    public video;
    public requisitos;

    constructor(
        private _coreConfigService: CoreConfigService,
        private sanitizer: DomSanitizer,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private modalService: NgbModal,
        private paramService: ParametrizacionesService,
    ) {
        // localStorage.removeItem('simulador');
        this.video = {
            url: 'https://www.youtube.com/embed/aK52RxV2XuI'
        };
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
        this.paramService.obtenerListaPadresSinToken('DESCRIPCION_VIDEO_INFORMATIVO').subscribe((info) => {
            this.requisitos = info[0];
            // console.log('typeof', this.requisitos.config);
            this.requisitos.config = this.requisitos.config.map(item => {
                return item.replace('${{montoCreditoFinal}}', montoCreditoFinal)
                    .replace('${{cuotaMensual}}', cuotaMensual);
            });
        });
    }

    continuar() {
        this.estado.emit(2);
    }

    get f() {
        return this.registerForm.controls;
    }

    /**
     * On init
     */
    ngOnInit(): void {

        // this.usuario = this._coreMenuService.grpPersonasUser;

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
        // this._creditosAutonomosService.obtenerInformacion(this.usuario.id).subscribe(info => {
        //   this.fecha = info.fechaNacimiento;
        //   this.imagen = info.imagen;
        //   this.registerForm.patchValue({
        //     identificacion: info.identificacion,
        //     nombres: info.nombres,
        //     apellidos: info.apellidos,
        //     genero: info.genero,
        //     // fechaNacimiento: [info.fechaNacimiento],
        //     edad: info.edad,
        //     whatsapp: info.whatsapp,
        //   });
        // });
    }

    ngAfterViewInit(): void {
        // if (this.usuario.estado == "3") {
        //   this.modalWhatsapp(this.whatsapp);
        // }
    }

    subirImagen(event: any) {
        if (event.target.files && event.target.files[0]) {
            const nuevaImagen = event.target.files[0];

            const reader = new FileReader();

            reader.onload = (event: any) => {
                this.imagen = event.target.result;
            };

            reader.readAsDataURL(event.target.files[0]);
            const imagen = new FormData();
            imagen.append('imagen', nuevaImagen, nuevaImagen.name);
            // this._creditosAutonomosService.subirImagenRegistro(this.usuario.id, imagen).subscribe((info) => {
            // });
        }
    }

    obtenerURL() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.video.url);
    }

    calcularEdad() {
        // this.informacion.edad = moment().diff(this.f.fechaNacimiento.value[0], 'years');
        // this.informacion.fechaNacimiento = moment(this.f.fechaNacimiento.value[0]).format('YYYY-MM-DD');
        // this.registerForm.patchValue({
        //   edad: this.informacion.edad
        // });
    }

    guardarRegistro() {

        this.submitted = true;
        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        // this.informacion.apellidos = this.f.apellidos.value;
        // this.informacion.edad = this.f.edad.value;
        // // this.informacion.fechaNacimiento = this.f.fechaNacimiento.value;;
        // this.informacion.genero = this.f.genero.value;
        // this.informacion.identificacion = this.f.identificacion.value;
        // this.informacion.nombres = this.f.nombres.value;
        // this.informacion.whatsapp = this.f.whatsapp.value;
        // this.informacion.user_id = this.usuario.id;

        // this._creditosAutonomosService.guardarInformacion(this.informacion).subscribe(info => {
        //   this._bienvenidoService.cambioDeEstado(
        //     {
        //       estado: "3",
        //       id: this.usuario.id
        //     }
        //   ).subscribe(infoCambio => {
        //     this.usuario.estado = "3";
        //     this.usuario.persona = info;
        //     localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
        //     this.modalWhatsapp(this.whatsapp);
        //   });
        // });
    }

    modalWhatsapp(modalVC) {
        this.modalService.open(modalVC);
    }

    validarWhatsapp() {
        // this._creditosAutonomosService.validarWhatsapp({
        //   user_id: this.usuario.id,
        //   codigo: this.codigo
        // }).subscribe(info => {
        //   if (info.message) {
        //     this._bienvenidoService.cambioDeEstado(
        //       {
        //         estado: "4",
        //         id: this.usuario.id
        //       }
        //     ).subscribe(infoCambio => {
        //       this.usuario.estado = "4";
        //       localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
        //       this.modalService.dismissAll();
        //       setTimeout(() => {
        //         this._router.navigate(['/']);
        //       }, 100);
        //     });

        //   }
        // }, error => {
        //   this.error = "Hay un fallo al tratar de verificar su código, intentelo nuevamente"
        // });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
