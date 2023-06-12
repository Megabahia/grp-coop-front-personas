import { Component, OnInit, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { FlatpickrOptions } from 'ng2-flatpickr';
import moment from 'moment';
import { CoreConfigService } from '../../../../../../@core/services/config.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CreditosAutonomosService } from '../creditos-autonomos.service';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { RucPersona } from 'app/main/personas/models/persona';
import { ParametrizacionesService } from '../../../servicios/parametrizaciones.service';

@Component({
  selector: 'app-ruc-persona-aut',
  templateUrl: './ruc-persona.component.html',
  styleUrls: ['./ruc-persona.component.scss']
})
export class RucPersonaAutComponent implements OnInit {
  @Output() estado = new EventEmitter<number>();
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('whatsapp') whatsapp;
  public error;
  // public informacion: CompletarPerfil;
  public coreConfig: any;
  public imagen;
  public rucPersonaForm: FormGroup;
  public loading = false;
  public submittedRuc = false;
  public usuario;
  public paisOpciones;
  public provinciaOpciones;
  public ciudadOpciones;
  public categoriaEmpresaOpciones;
  public rucPersona: RucPersona;
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
    private ref: ChangeDetectorRef,
    private _coreMenuService: CoreMenuService,
    // private _creditosAutonomosService: CreditosAutonomosService,
    // private _bienvenidoService: BienvenidoService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {
    this.usuario = this._coreMenuService.grpPersonasUser;
    this.video = {
      url: "https://www.youtube.com/embed/aK52RxV2XuI"
    };
    this.rucPersona = this.inicializarRucPersona();
    // this.informacion = {
    //   apellidos: "",
    //   user_id: "",
    //   edad: 0,
    //   fechaNacimiento: "",
    //   genero: "",
    //   identificacion: "",
    //   nombres: "",
    //   whatsapp: ""
    // }
    this._unsubscribeAll = new Subject();

    // Configure the layout
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  get rucPersForm() {
    return this.rucPersonaForm.controls;
  }
  inicializarRucPersona(): RucPersona {
    return {
      _id: "",
      actividadComercial: "",
      antiguedadRuc: 0,
      ciudad: "",
      gastoMensual: 0,
      identificacion: "",
      nombreComercial: "",
      pais: "",
      provincia: "",
      razonSocial: "",
      ruc: "",
      user_id: "",
      ventaMensual: 0
    }
  }
  /**
   * On init
   */
  ngOnInit(): void {

    // this.usuario = this._coreMenuService.grpPersonasUser;

    this.rucPersonaForm = this._formBuilder.group({
      ruc: ['', [Validators.required]],
      nombreComercial: ['', [Validators.required]],
      razonSocial: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      anioAntiguedad: ['', [Validators.required]],
      actividadComercial: ['', [Validators.required]],
      monto: ['', [Validators.required]],
      gastos: ['', [Validators.required]],

    });
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

  }
  ngAfterViewInit(): void {
    this._creditosAutonomosService.obtenerDatosRuc(
      this.usuario.id
    )
      .subscribe((info) => {
        this.rucPersona = info;
        this.obtenerPaisOpciones();
        this.obtenerProvinciaOpciones();
        this.obtenerCiudadOpciones();
      });
      this.rucPersona.identificacion = this.usuario.persona.identificacion;
      this.ref.detectChanges();
    this.obtenerCategoriaEmpresaOpciones();
  }

  obtenerPaisOpciones() {
    this.paramService.obtenerListaPadres("PAIS").subscribe((info) => {
      this.paisOpciones = info;
    });
  }
  obtenerProvinciaOpciones() {
    this.paramService.obtenerListaHijos(this.rucPersona.pais, "PAIS").subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }
  obtenerCiudadOpciones() {
    this.paramService.obtenerListaHijos(this.rucPersona.provincia, "PROVINCIA").subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }
  obtenerCategoriaEmpresaOpciones() {
    this.paramService.obtenerListaPadres("CATEGORIA_EMPRESA").subscribe((info) => {
      this.categoriaEmpresaOpciones = info;
    });
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
    // this.rucPersonaForm.patchValue({
    //   edad: this.informacion.edad
    // });
  }
  guardarRegistro() {


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
  continuar() {
    this.submittedRuc = true;
    // stop here if form is invalid
    if (this.rucPersonaForm.invalid) {
      return;
    }
    this.rucPersona.user_id = this.usuario.id;
    this._creditosAutonomosService.actualizarDatosRuc(this.rucPersona).subscribe((info) => {
      this.estado.emit(6);
    });
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
