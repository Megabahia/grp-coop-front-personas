import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BienvenidoService } from '../bienvenido/bienvenido.service';
import { takeUntil } from 'rxjs/operators';
import { CreditosAutonomosService } from './creditos-autonomos.service';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { CoreConfigService } from '../../../../../@core/services/config.service';
import { CoreMenuService } from '../../../../../@core/components/core-menu/core-menu.service';
import { CompletarPerfil, SolicitarCredito } from '../../models/persona';
import moment from 'moment';
import { User } from '../../../../auth/models/user';

@Component({
  selector: 'app-creditos-autonomos',
  templateUrl: './creditos-autonomos.component.html',
  styleUrls: ['./creditos-autonomos.component.scss']
})
export class CreditosAutonomosComponent implements OnInit {
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('whatsapp') whatsapp;
  public error;
  public informacion: CompletarPerfil;
  public coreConfig: any;
  public imagen;
  public registerForm: FormGroup;
  public loading = false;
  public submitted = false;
  public usuario: User;
  public idEmpresa = "";
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
    private _creditosAutonomosService: CreditosAutonomosService,
    private _bienvenidoService: BienvenidoService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {
    this.informacion = {
      apellidos: "",
      user_id: "",
      edad: 0,
      fechaNacimiento: "",
      genero: "",
      identificacion: "",
      nombres: "",
      whatsapp: ""
    }
    this.solicitarCredito = this.inicialidarSolicitudCredito();
    this._unsubscribeAll = new Subject();

  }

  inicialidarSolicitudCredito(): SolicitarCredito {
    return {
      _id: "",
      aceptaTerminos: 0,
      empresaComercial_id: "",
      empresaIfis_id: "",
      estado: "Confirmado",
      monto: 0,
      plazo: 0,
      user_id: "",
      canal: "Autonomo",
      tipoCredito: "Autonomo",
      concepto: "Autonomo",
      nombres: "",
      apellidos: "",
      numeroIdentificacion: "",
    }
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

    this.usuario = this._coreMenuService.grpPersonasUser;

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
    this._creditosAutonomosService.obtenerInformacion(this.usuario.id).subscribe(info => {
      this.fecha = info.fechaNacimiento;
      this.registerForm.patchValue({
        identificacion: info.identificacion,
        nombres: info.nombres,
        apellidos: info.apellidos,
        genero: info.genero,
        // fechaNacimiento: [info.fechaNacimiento],
        edad: info.edad,
        whatsapp: info.whatsapp,
      });
    });
  }
  ngAfterViewInit(): void {
    this.solicitarCredito.user_id = this.usuario.id;
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

    }
  }
  calcularEdad() {
    this.informacion.edad = moment().diff(this.f.fechaNacimiento.value[0], 'years');
    this.informacion.fechaNacimiento = moment(this.f.fechaNacimiento.value[0]).format('YYYY-MM-DD');
    this.registerForm.patchValue({
      edad: this.informacion.edad
    });
  }
  guardarRegistro() {

    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    this.informacion.apellidos = this.f.apellidos.value;
    this.informacion.edad = this.f.edad.value;
    // this.informacion.fechaNacimiento = this.f.fechaNacimiento.value;;
    this.informacion.genero = this.f.genero.value;
    this.informacion.identificacion = this.f.identificacion.value;
    this.informacion.nombres = this.f.nombres.value;
    this.informacion.whatsapp = this.f.whatsapp.value;
    this.informacion.user_id = this.usuario.id;

    this._creditosAutonomosService.guardarInformacion(this.informacion).subscribe(info => {
      this._bienvenidoService.cambioDeEstado(
        {
          estado: "3",
          id: this.usuario.id
        }
      ).subscribe(infoCambio => {
        this.usuario.estado = "3";
        this.usuario.persona = info;
        localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
      });
    });
  }
  continuar(value) {
    if (value == 7) {
      // Agregar informacion al credito
      this.solicitarCredito.nombres = this.usuario.persona.nombres;
      this.solicitarCredito.apellidos = this.usuario.persona.apellidos;
      this.solicitarCredito.numeroIdentificacion = this.usuario.persona.identificacion;
      this._creditosAutonomosService.crearCredito(this.solicitarCredito).subscribe((info) => {
        this.proceso = value;
      });
    } else {
      this.proceso = value;
    }
  }
  obtenerIdIfi(value) {
    console.log(value);
    this.solicitarCredito.empresaIfis_id = value;
  }
  obtenerEstablecimiento(value) {
    this.solicitarCredito.empresaComercial_id = value;
    this.idEmpresa = value;
  }
  obtenerMonto(value) {
    this.solicitarCredito.plazo = value.plazo;
    this.solicitarCredito.monto = value.monto;
    this.solicitarCredito.aceptaTerminos = value.aceptaTerminos ? 1:0;
  }
  abrirModal(modal) {
    this.modalService.open(modal);
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
