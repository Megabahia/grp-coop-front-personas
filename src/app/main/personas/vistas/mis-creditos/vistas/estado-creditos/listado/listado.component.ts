import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {CompletarPerfil, InformacionCompleta, SolicitarCredito} from '../../../../../models/persona';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../../../../../auth/models';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../../../../@core/services/config.service';
import {CoreMenuService} from '../../../../../../../../@core/components/core-menu/core-menu.service';
import {CreditosPreAprobadosService} from '../../../../creditos-pre-aprobados/creditos-pre-aprobados.service';
import {CreditosAutonomosService} from '../../../../creditos-autonomos/creditos-autonomos.service';
import {DatePipe} from '@angular/common';
import {ParametrizacionesService} from '../../../../../servicios/parametrizaciones.service';
import {BienvenidoService} from '../../../../bienvenido/bienvenido.service';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import moment from 'moment';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
  providers: [DatePipe]
})
export class ListadoComponent implements OnInit {
  @ViewChild('establecimientoSeleccionadoMdl') establecimientoSeleccionadoMdl;
  @ViewChild('datosContactoMdl') datosContactoMdl;
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('whatsapp') whatsapp;
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public page = 1;
  public page_size: any = 10;
  public maxSize;
  public collectionSize;
  public error;
  public informacion: CompletarPerfil;
  public informacionBasica: InformacionCompleta;
  public submittedPersona = false;
  public coreConfig: any;
  public personaForm: FormGroup;
  public datosContactoForm: FormGroup;
  public imagen;
  public registerForm: FormGroup;
  public loading = false;
  public submitted = false;
  public usuario: User;
  public idEmpresa = '';
  public listaCreditos;
  public listaConvenios;
  public idCredito = '';
  public idEmpresaFinanciera = '';
  public idEmpresaComercial = '';
  public proceso = 1;
  public solicitarCredito: SolicitarCredito;
  public startDateOptions: FlatpickrOptions = {
    altInput: true,
    mode: 'single',
    altFormat: 'Y-n-j',
    altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
  };
  public codigo;
  public fecha;
  public paisOpciones;
  public provinciaOpciones;
  public ciudadOpciones;
  public tipoGeneroOpciones;
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
      private _coreConfigService: CoreConfigService,
      private _coreMenuService: CoreMenuService,
      private _creditosPreAprobadosService: CreditosPreAprobadosService,
      private _creditosAutonomosService: CreditosAutonomosService,
      private datePipe: DatePipe,
      private paramService: ParametrizacionesService,
      private _bienvenidoService: BienvenidoService,
      private _router: Router,
      private _formBuilder: FormBuilder,
      private modalService: NgbModal,
      private changeDetector: ChangeDetectorRef,
  ) {
    this.informacionBasica = this.inicializarInformacion();

    this.informacion = {
      apellidos: '',
      user_id: '',
      edad: 0,
      fechaNacimiento: '',
      genero: '',
      identificacion: '',
      nombres: '',
      whatsapp: ''
    };
    this.solicitarCredito = this.inicialidarSolicitudCredito();
    this._unsubscribeAll = new Subject();

  }

  inicializarInformacion() {
    return {
      created_at: '',
      identificacion: '',
      nombres: '',
      apellidos: '',
      genero: '',
      direccion: '',
      fechaNacimiento: '',
      edad: 0,
      ciudad: '',
      provincia: '',
      pais: '',
      email: '',
      emailAdicional: '',
      telefono: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      youtube: '',
    };
  }

  inicialidarSolicitudCredito(): SolicitarCredito {
    return {
      _id: '',
      aceptaTerminos: 0,
      empresaComercial_id: '',
      empresaIfis_id: '',
      estado: '',
      monto: 0,
      plazo: 0,
      user_id: '',
      canal: 'Autonomo'
    };
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

    this.usuario = this._coreMenuService.grpPersonasUser;

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
      this.obtenerPaisOpciones();
      this.obtenerProvinciaOpciones();
      this.obtenerCiudadOpciones();
    });
    this.obtenerGeneroOpciones();
    this.obtenerListaCreditos();

  }

  transformarFecha(fecha) {
    const nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }

  obtenerPaisOpciones() {
    this.paramService.obtenerListaPadres('PAIS').subscribe((info) => {
      this.paisOpciones = info;
    });
  }

  obtenerGeneroOpciones() {
    this.paramService.obtenerListaPadres('GENERO').subscribe((info) => {
      this.tipoGeneroOpciones = info;
    });
  }

  obtenerProvinciaOpciones() {
    this.paramService.obtenerListaHijos(this.informacionBasica.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudadOpciones() {
    this.paramService.obtenerListaHijos(this.informacionBasica.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaCreditos();
    });
  }

  obtenerListaCreditos() {
    this._creditosPreAprobadosService.obtenerListaCreditos({
      page: this.page - 1,
      page_size: this.page_size,
      // tipoCredito: 'PreAprobado',
      // user_id: this.usuario.id,
      identificacion: this.usuario.persona.identificacion
    }).subscribe((info) => {
      this.listaCreditos = info.info;
      this.collectionSize = info.cont;
    });
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

    }
  }

  calcularEdad() {
    this.informacionBasica.edad = moment().diff(this.persForm.fechaNacimiento.value[0], 'years');
    this.informacionBasica.fechaNacimiento = moment(this.persForm.fechaNacimiento.value[0]).format('YYYY-MM-DD');
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
    this._creditosAutonomosService.guardarInformacion({...this.informacionBasica, user_id: this.usuario.id, imagen: []})
        .subscribe((info) => {
          this._creditosPreAprobadosService.actualizarCredito({
            id: this.idCredito,
            estado: 'Confirmado',
            empresaIfis_id: this.idEmpresaFinanciera,
            empresaComercial_id: this.idEmpresaComercial
          }).subscribe(() => {
            this.obtenerListaCreditos();
            this.cerrarModal();
          });
        });
  }

  verEmpresas(id, empresa, empresas) {
    this.idCredito = id;
    this.idEmpresaFinanciera = empresa;
    this._creditosPreAprobadosService.obtenerListaEmpresasArray({empresas}).subscribe((info) => {
      this.listaConvenios = info.info;

    });
    this.abrirModalLg(this.establecimientoSeleccionadoMdl);
  }

  obtenerEmpresaComercial(idEmpresaComercial) {
    this.idEmpresaComercial = idEmpresaComercial;
    this.changeDetector.detectChanges();
    this.abrirModalLg(this.datosContactoMdl);
    this.changeDetector.detectChanges();
  }

  obtenerIdIfi(value) {
    this.solicitarCredito.empresaIfis_id = value;
  }

  obtenerEstablecimiento(value) {
    this.solicitarCredito.empresaComercial_id = value;
    this.idEmpresa = value;
    this.changeDetector.detectChanges();
  }

  obtenerMonto(value) {
    this.solicitarCredito.plazo = value.plazo;
    this.solicitarCredito.monto = value.monto;
    this.solicitarCredito.aceptaTerminos = value.aceptaTerminos ? 1 : 0;
  }

  abrirModalLg(modal) {
    this.modalService.open(modal, {
      size: 'lg'
    });
    this.changeDetector.detectChanges();
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
