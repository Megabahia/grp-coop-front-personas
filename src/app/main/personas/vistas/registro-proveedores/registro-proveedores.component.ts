import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CoreSidebarService} from '../../../../../@core/components/core-sidebar/core-sidebar.service';
import {DatePipe} from '@angular/common';
import {RegistroProveedorService} from './registro-proveedor.service';

@Component({
  selector: 'app-registro-proveedores',
  templateUrl: './registro-proveedores.component.html',
  styleUrls: ['./registro-proveedores.component.scss'],
  providers: [DatePipe],
})
export class RegistroProveedoresComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('mensajeModal') mensajeModal;
  @ViewChild('eliminarEmpresaMdl') eliminarEmpresaMdl;
  public page = 1;
  public page_size: any = 10;
  public maxSize;
  public collectionSize;
  public proveedores;
  public empresa;
  public imagen;
  private _unsubscribeAll: Subject<any>;
  private idEmpresa;
  public empresaForm: FormGroup;
  public proveedoresubmitted: boolean;
  public empresaFormData = new FormData();

  public mensaje = '';
  public cargandoEmpresa = false;
  public tipoEmpresaOpciones;
  public categoriaEmpresaOpciones;
  public paisOpciones;
  public provinciaOpciones;
  public ciudadOpciones;

  public pantalla = 0;
  public proveedor = {};

  constructor
  (
    private _proveedorService: RegistroProveedorService,
    private datePipe: DatePipe,
    private _coreSidebarService: CoreSidebarService,
    private _formBuilder: FormBuilder,
    private _modalService: NgbModal,
  ) {
    this._unsubscribeAll = new Subject();
    this.idEmpresa = '';
    this.empresa = this.inicializarEmpresa();
  }

  inicializarEmpresa() {
    return {
      id: '',
      direccion: '',
      ciudad: '',
      correo: '',
      estado: '',
      nombreComercial: '',
      nombreEmpresa: '',
      pais: '',
      provincia: '',
      ruc: '',
      telefono1: '',
      telefono2: '',
      tipoCategoria: '',
      tipoEmpresa: ''
    };
  }

  async subirImagen(event) {

    if (event.target.files && event.target.files[0]) {
      const imagen = event.target.files[0];
      this.imagen = imagen.name;
      this.empresaFormData.delete('imagen');
      this.empresaFormData.append('imagen', imagen, Date.now() + '_' + imagen.name);
    }
  }

  ngOnInit(): void {
    this.empresaForm = this._formBuilder.group({
      direccion: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      nombreComercial: ['', [Validators.required]],
      nombreEmpresa: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ruc: ['', [Validators.required]],
      telefono1: ['', [Validators.required]],
      telefono2: ['', [Validators.required]],
      tipoCategoria: ['', [Validators.required]],
      tipoEmpresa: ['', [Validators.required]],
    });
  }

  ngAfterViewInit() {
    this.iniciarPaginador();
    this.obtenerListaProveedores();
  }

  cambiarPantalla(pantalla: number, proveedor?): void {
    this.proveedor = proveedor;
    this.pantalla = pantalla;
    if (this.pantalla === 0) {
      this.obtenerListaProveedores();
    }
  }

  visualizarNombreArchivo(nombre) {
    const stringArchivos = 'https://globalredpymes.s3.amazonaws.com/CORP/imgproveedores/';
    return nombre.replace(stringArchivos, '');
  }

  get empForm() {
    return this.empresaForm.controls;
  }

  eliminarProveedor(id) {
    this._proveedorService.delete(id).subscribe(info => {
      this.obtenerListaProveedores();
    });
  }

  obtenerListaProveedores() {
    this._proveedorService.list({
      page: this.page - 1, page_size: this.page_size
    }).subscribe(info => {
      this.proveedores = info.info;
      this.collectionSize = info.cont;
    });
  }

  iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProveedores();
    });
  }

  eliminarEmpresaModal(id) {
    this.idEmpresa = id;
    this.abrirModal(this.eliminarEmpresaMdl);
  }

  abrirModal(modal) {
    this._modalService.open(modal);
  }

  cerrarModal() {
    this._modalService.dismissAll();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
