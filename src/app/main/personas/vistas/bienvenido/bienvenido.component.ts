import { Component, OnInit, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '../../../../../@core/services/config.service';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { BienvenidoService } from './bienvenido.service';
import { CoreMenuService } from '../../../../../@core/components/core-menu/core-menu.service';
import { ParametrizacionesService } from '../../servicios/parametrizaciones.service';
import { GanarSuperMoneda } from '../../models/supermonedas';

@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.component.html',
  styleUrls: ['./bienvenido.component.scss']
})
export class BienvenidoComponent implements OnInit {
  @ViewChild('mensajeModal') mensajeModal;
  //  Public
  public coreConfig: any;
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public ganarMonedas;
  public superMonedas: GanarSuperMoneda;
  public usuario;
  public empresaId = "";
  public error = '';
  public mensaje = '';
  public passwordTextType: boolean;
  productosPromocion;
  public swiperResponsive: SwiperConfigInterface;
  producto;
  // public swiperResponsive: SwiperConfigInterface = {
  //   slidesPerView: 3,
  //   spaceBetween: 50,
  //   navigation: {
  //     nextEl: '.swiper-button-next',
  //     prevEl: '.swiper-button-prev'
  //   },
  //   breakpoints: {
  //     1024: {
  //       slidesPerView: 3,
  //       spaceBetween: 40
  //     },
  //     768: {
  //       slidesPerView: 2,
  //       spaceBetween: 30
  //     },
  //     640: {
  //       slidesPerView: 1,
  //       spaceBetween: 20
  //     },
  //     320: {
  //       slidesPerView: 1,
  //       spaceBetween: 10
  //     }
  //   }
  // };


  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private modalService: NgbModal,
    private _bienvenidoService: BienvenidoService,
    private _coreMenuService: CoreMenuService,
    private paramService: ParametrizacionesService,
  ) {
    this.usuario = this._coreMenuService.grpPersonasUser;

    this._unsubscribeAll = new Subject();
    this.superMonedas = this.inicializarSuperMoneda();
    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  inicializarSuperMoneda(): GanarSuperMoneda {
    return {
      credito: 0,
      descripcion: "",
      tipo: "Credito",
      user_id: this.usuario.id,
      empresa_id: this.empresaId
    }
  }
  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  completarPerfil() {
    let usuario = this._coreMenuService.grpPersonasUser;
    this._bienvenidoService.guardarSuperMonedas(this.superMonedas).subscribe((info) => {
      this._bienvenidoService.cambioDeEstado(
        {
          estado: "2",
          id: usuario.id
        }
      ).subscribe((info) => {
        usuario.estado = "2";
        localStorage.setItem('grpPersonasUser', JSON.stringify(usuario));

        setTimeout(() => {
          this._router.navigate(['/']);
        }, 100);
      }, (error) => {
        this.mensaje = "Ha ocurrido un error";
        this.abrirModal(this.mensajeModal);
      });

    });

    // Login
    this.loading = true;

    // redirect to home page
  }
  omitirContinuar() {
    let usuario = this._coreMenuService.grpPersonasUser;
    this._bienvenidoService.cambioDeEstado(
      {
        estado: "6",
        id: usuario.id
      }
    ).subscribe((info) => {
      usuario.estado = "6";
      localStorage.setItem('grpPersonasUser', JSON.stringify(usuario));
      setTimeout(() => {
        this._router.navigate(['/']);
      }, 100);
    },
      (error) => {
        this.mensaje = "Ha ocurrido un error al actualizar su imagen";
        this.abrirModal(this.mensajeModal);
      });
    // Login
    this.loading = true;

    // redirect to home page
  }
  obtenerProductos() {
    let subsObtenerProductos = this._bienvenidoService.obtenerProductos(
      {
        tipo: "presentacion",
      }
    ).subscribe((valor) => {
      this.productosPromocion = valor.info;
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
            slidesPerView: 2,
            spaceBetween: 30
          },
          640: {
            slidesPerView: 1,
            spaceBetween: 20
          },
          320: {
            slidesPerView: 1,
            spaceBetween: 10
          }
        }
      };
    });

  }


  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.obtenerProductos();
    this.obtenerEmpresaId();
    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    this.paramService.obtenerParametroNombreTipo("monedas_bienvenida", "GANAR_SUPERMONEDAS").subscribe((info) => {
      this.ganarMonedas = info;
      this.superMonedas.credito = this.ganarMonedas.valor;
      this.superMonedas.descripcion = "Gana " + this.ganarMonedas.valor + " supermonedas por bienvenida";
    });
  }
  obtenerEmpresaId() {
    this._bienvenidoService.obtenerEmpresa({
      nombreComercial: "Global Red Pyme"
    }).subscribe((info) => {
      this.superMonedas.empresa_id = info._id;
    }, (error) => {
      this.mensaje = "Ha ocurrido un error al actualizar su imagen";
      this.abrirModal(this.mensajeModal);
    });
  }
  modalOpenVC(modalVC, id) {
    let subsObtenerProducto = this._bienvenidoService.obtenerProducto(id).subscribe((valor) => {
      this.producto = valor;
      this.modalService.open(modalVC, {
        centered: true,
        size: 'lg'
      });
    });
  }
  abrirModal(modal) {
    this.modalService.open(modal);
  }
  cerrarModal() {
    this.modalService.dismissAll();
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
