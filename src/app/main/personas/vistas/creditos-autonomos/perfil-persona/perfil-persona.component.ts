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
import { CoreMenuService } from '../../../../../../@core/components/core-menu/core-menu.service';
import { DatePipe } from '@angular/common';
import { InformacionCompleta } from 'app/main/personas/models/persona';
import { ParametrizacionesService } from '../../../servicios/parametrizaciones.service';

@Component({
  selector: 'app-perfil-persona-aut',
  templateUrl: './perfil-persona.component.html',
  styleUrls: ['./perfil-persona.component.scss'],
  providers: [DatePipe]

})
export class PerfilPersonaAutComponent implements OnInit {
  @Output() estado = new EventEmitter<number>();
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('whatsapp') whatsapp;
  public error;
  // public informacion: CompletarPerfil;
  public coreConfig: any;
  public imagen;
  public personaForm: FormGroup;
  public datosContactoForm: FormGroup;
  public loading = false;
  public submittedPersona = false;
  public usuario;
  public informacionBasica: InformacionCompleta;
  public paisOpciones;
  public provinciaOpciones;
  public ciudadOpciones;
  public tipoGeneroOpciones;
  // public usuario: User;
  public startDateOptions: FlatpickrOptions = {
    defaultDate: 'today',
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
    private paramService: ParametrizacionesService,

    private _coreMenuService: CoreMenuService,
    private _creditosAutonomosService: CreditosAutonomosService,
    // private _bienvenidoService: BienvenidoService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.informacionBasica = this.inicializarInformacion();

    this.usuario = this._coreMenuService.grpPersonasUser;

    this.video = {
      url: "https://www.youtube.com/embed/aK52RxV2XuI"
    };
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
  inicializarInformacion() {
    return {
      created_at: "",
      identificacion: "",
      nombres: "",
      apellidos: "",
      genero: "",
      direccion: "",
      fechaNacimiento: "",
      edad: 0,
      ciudad: "",
      provincia: "",
      pais: "",
      email: "",
      emailAdicional: "",
      telefono: "",
      whatsapp: "",
      facebook: "",
      instagram: "",
      twitter: "",
      tiktok: "",
      youtube: "",
    }
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  get persForm() {
    return this.personaForm.controls;
  }
  get datosContForm() {
    return this.datosContactoForm.controls;
  }

  /**
   * On init
   */
  ngOnInit(): void {


    this.personaForm = this._formBuilder.group({
      identificacion: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      genero: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      edad: [0, Validators.required],
    });
    this.datosContactoForm = this._formBuilder.group({
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      whatsapp: ['', [Validators.required]],
    });
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

  }
  ngAfterViewInit(): void {
    this._creditosAutonomosService.obtenerInformacion(this.usuario.id).subscribe((info) => {
      // console.log(info);
      this.informacionBasica = info;
      this.informacionBasica.created_at = this.transformarFecha(info.created_at);
      this.fecha = this.transformarFecha(info.fechaNacimiento);
      this.changeDetector.detectChanges();
      this.obtenerPaisOpciones();
      this.obtenerProvinciaOpciones();
      this.obtenerCiudadOpciones();
    });
    this.obtenerGeneroOpciones();
    

  }

  obtenerURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.video.url);
  }
  obtenerPaisOpciones() {
    this.paramService.obtenerListaPadres("PAIS").subscribe((info) => {
      this.paisOpciones = info;
    });
  }
  obtenerGeneroOpciones() {
    this.paramService.obtenerListaPadres("GENERO").subscribe((info) => {
      this.tipoGeneroOpciones = info;
    });
  }
  obtenerProvinciaOpciones() {
    this.paramService.obtenerListaHijos(this.informacionBasica.pais, "PAIS").subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }
  obtenerCiudadOpciones() {
    this.paramService.obtenerListaHijos(this.informacionBasica.provincia, "PROVINCIA").subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }
  calcularEdad() {
    this.informacionBasica.edad = moment().diff(this.persForm.fechaNacimiento.value[0], 'years');
    this.informacionBasica.fechaNacimiento = moment(this.persForm.fechaNacimiento.value[0]).format('YYYY-MM-DD');
  }
  modalWhatsapp(modalVC) {
    this.modalService.open(modalVC);
  }
  continuar() {
    this.submittedPersona = true;
    // stop here if form is invalid
    if (this.datosContactoForm.invalid) {
      return;
    }
    if (this.personaForm.invalid) {
      return;
    }
    
    this._creditosAutonomosService.guardarInformacion({ ...this.informacionBasica, user_id: this.usuario.id, imagen: [] })
      .subscribe((info) => {
    this.estado.emit(3);
      });
  }
  validarWhatsapp() {

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

