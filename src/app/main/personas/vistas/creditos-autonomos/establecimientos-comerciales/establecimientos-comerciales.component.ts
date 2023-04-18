import { Component, OnInit, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { FlatpickrOptions } from 'ng2-flatpickr';
import moment from 'moment';
import { CoreConfigService } from '../../../../../../@core/services/config.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { CreditosAutonomosService } from '../creditos-autonomos.service';
import { ParametrizacionesService } from '../../../servicios/parametrizaciones.service';

@Component({
  selector: 'app-establecimientos-comerciales-aut',
  templateUrl: './establecimientos-comerciales.component.html',
  styleUrls: ['./establecimientos-comerciales.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})
export class EstablecimientosComercialesAutComponent implements OnInit {
  @Output() estado = new EventEmitter<number>();
  @Output() establecimiento = new EventEmitter<string>();
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('whatsapp') whatsapp;
  public error;
  // public informacion: CompletarPerfil;
  public coreConfig: any;
  public imagen;
  public registerForm: FormGroup;
  public loading = false;
  public submitted = false;
  public ciudad = "";
  public tipoCategoria = "";
  public productos;
  public ciudadOpciones;
  public swiperResponsive: SwiperConfigInterface;
  public listaEstablecimientos;
  public categoriaEmpresaOpciones;
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
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private sanitizer: DomSanitizer,
    private _creditosAutonomosService: CreditosAutonomosService,
    private paramService: ParametrizacionesService,

    // private _coreMenuService: CoreMenuService,
    // private _creditosAutonomosService: CreditosAutonomosService,
    // private _bienvenidoService: BienvenidoService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {
    this.video = {
      url: "https://www.youtube.com/embed/aK52RxV2XuI"
    };
    this.productos = {
      info: [
        {
          nombre: "Coral",
          categoria: "Super mercados",
          imagen: "algo3"
        }
      ]
    }
    this._unsubscribeAll = new Subject();
    this.swiperResponsive = {
      slidesPerView: 3,
      spaceBetween: 50,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      breakpoints: {
        1024: {
          slidesPerView: 3,
          spaceBetween: 40
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 10
        }
      }
    };
    // Configure the layout
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
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

  }
  inicializarSlider() {
    return {
      slidesPerView: 3,
      spaceBetween: 50,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      breakpoints: {
        1024: {
          slidesPerView: 3,
          spaceBetween: 40
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 10
        }
      }
    };
  }
  ngAfterViewInit(): void {
    this.obtenerListaEmpresasComerciales();
    this.obtenerCiudadesOpciones();
    this.obtenerCategoriaEmpresaOpciones()
  }
  obtenerListaEmpresasComerciales(){
    this._creditosAutonomosService.obtenerListaEmpresasComerciales({
      ciudad: this.ciudad,
      tipoCategoria: this.tipoCategoria
    }).subscribe((info) => {
      this.listaEstablecimientos = info.info;
      this.swiperResponsive = this.inicializarSlider();
    });
  }
  obtenerCiudadesOpciones() {
    this.paramService.obtenerListaPadres("CIUDAD").subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }
  obtenerCategoriaEmpresaOpciones() {
    this.paramService.obtenerListaPadres("CATEGORIA_EMPRESA").subscribe((info) => {
      this.categoriaEmpresaOpciones = info;
    });
  }
  async continuar(id) {
    await this.establecimiento.emit(id);
    await this.estado.emit(4);
  }
  subirImagen(event: any) {
    if (event.target.files && event.target.files[0]) {
      let nuevaImagen = event.target.files[0];

      let reader = new FileReader();

      reader.onload = (event: any) => {
        this.imagen = event.target.result;
      };

      reader.readAsDataURL(event.target.files[0]);
      let imagen = new FormData();
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
