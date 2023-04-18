import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
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
import { EmpresaInformacion } from 'app/main/personas/models/empresa';
import { ParametrizacionesService } from '../../../servicios/parametrizaciones.service';


@Component({
  selector: 'app-establecimiento-seleccionado-aut',
  templateUrl: './establecimiento-seleccionado.component.html',
  styleUrls: ['./establecimiento-seleccionado.component.scss']
})
export class EstablecimientoSeleccionadoAutComponent implements OnInit {
  @Output() estado = new EventEmitter<number>();
  @Output() valores = new EventEmitter<Object>();
  @Input() idEmpresa;
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('whatsapp') whatsapp;
  public error;
  // public informacion: CompletarPerfil;
  public coreConfig: any;
  public imagen;
  public solicitarForm: FormGroup;
  public loading = false;
  public submittedSolicitar = false;
  public empresa: EmpresaInformacion;
  public plazos = {
    plazos: []
  };
  public monto;
  public plazo = "";
  public aceptarTerminos = false;
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
    // private _bienvenidoService: BienvenidoService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {
    this.video = {
      url: "https://www.youtube.com/embed/aK52RxV2XuI"
    };
    this.empresa = this.inicializarEmpresa();
    this._unsubscribeAll = new Subject();

    // Configure the layout
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  get soliForm() {
    return this.solicitarForm.controls;
  }

  /**
   * On init
   */
  inicializarEmpresa(): EmpresaInformacion {
    return {
      _id: "",
      ciudad: "",
      correo: "",
      direccion: "",
      nombreComercial: "",
      nombreEmpresa: "",
      pais: "",
      provincia: "",
      ruc: "",
      telefono1: "",
      telefono2: "",
      tipoCategoria: "",
      tipoEmpresa: ""
    };
  }
  ngOnInit(): void {

    // this.usuario = this._coreMenuService.grpPersonasUser;

    this.solicitarForm = this._formBuilder.group({
      monto: [0, [Validators.required]],
      plazo: ['', [Validators.required]],
    });
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }
  ngAfterViewInit(): void {
    this._creditosAutonomosService.obtenerEmpresa(this.idEmpresa)
      .subscribe((info) => {
        this.empresa = info;
      });
    this.obtenerCategoriaEmpresaOpciones();
  }
  obtenerCategoriaEmpresaOpciones() {
    this.paramService.obtenerParametroNombreTipo("Plazos", "CREDITOS").subscribe((info) => {
      if (info.config) {
        this.plazos = JSON.parse(JSON.parse(JSON.stringify(info.config)));
      }
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
    // this.solicitarForm.patchValue({
    //   edad: this.informacion.edad
    // });
  }
  guardarRegistro() {

    this.submittedSolicitar = true;
    // stop here if form is invalid
    if (this.solicitarForm.invalid) {
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
  async continuar() {
    this.submittedSolicitar = true;
    if (this.solicitarForm.invalid || !this.aceptarTerminos) {
      return;
    }
    await this.valores.emit({
      monto: this.monto,
      plazo: this.plazo,
      aceptaTerminos: this.aceptarTerminos,
    });
    this.estado.emit(5);
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
