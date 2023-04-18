import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { CoreSidebarService } from "@core/components/core-sidebar/core-sidebar.service";
import { NgbPagination, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { MisFacturasService } from "./mis-facturas.service";
import { CoreMenuService } from "../../../../../../@core/components/core-menu/core-menu.service";
import { ParametrizacionesService } from "../../../servicios/parametrizaciones.service";
import { GanarSuperMoneda, FacturaFisica } from "../../../models/supermonedas";
import { BienvenidoService } from "../../bienvenido/bienvenido.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FlatpickrOptions } from "ng2-flatpickr";
import moment from "moment";

@Component({
  selector: "app-mis-facturas",
  templateUrl: "./mis-facturas.component.html",
  styleUrls: ["./mis-facturas.component.scss"],
  providers: [DatePipe],
})
export class MisFacturasComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild("mensajeModal") mensajeModal;
  sizeFile;
  public page = 1;
  public page_size: any = 10;
  public maxSize;
  public collectionSize;
  public usuario;
  public empresaId;
  public loading = false;
  public mensaje = "";
  public ganarMonedasFacElec;
  public ganarMonedasFacFisi;
  public submittedFactura = false;
  public superMonedasElec: GanarSuperMoneda;
  public superMonedasFisi: GanarSuperMoneda;
  public nombreFacElec = "";
  public nombreFacFisi = "";
  public categoriaEmpresaOpciones;
  public facFisiForm: FormGroup;
  public archivoFacElec = new FormData();
  public facFisiFormData = new FormData();
  public facturaFisica: FacturaFisica;
  public archivoFacturaFisica;
  public facturas;
  public paisOpciones;
  public provinciaOpciones;
  public ciudadOpciones;
  public fecha;
  private _unsubscribeAll: Subject<any>;
  public startDateOptions: FlatpickrOptions = {
    defaultDate: "today",
    altInput: true,
    mode: "single",
    altFormat: "Y-n-j",
    altInputClass:
      "form-control flat-picker flatpickr-input invoice-edit-input",
  };
  constructor(
    private _misFacturasService: MisFacturasService,
    private datePipe: DatePipe,
    private _coreSidebarService: CoreSidebarService,
    private _coreMenuService: CoreMenuService,
    private paramService: ParametrizacionesService,
    private _bienvenidoService: BienvenidoService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.usuario = this._coreMenuService.grpPersonasUser;

    this.superMonedasElec = this.inicializarSuperMoneda();
    this.superMonedasFisi = this.inicializarSuperMoneda();
    this.facturaFisica = this.inicializarFacturaFisica();
    this._unsubscribeAll = new Subject();
  }
  inicializarSuperMoneda(): GanarSuperMoneda {
    return {
      credito: 0,
      descripcion: "",
      tipo: "Credito",
      user_id: this.usuario.id,
      empresa_id: this.empresaId,
    };
  }
  tamaniodeArchivo() {
    this.paramService
      .obtenerParametroTipo("TAMANIO_ARCHIVOS_FACTURAS")
      .subscribe((info) => {
        this.sizeFile = info.valor;
      });
  }

  inicializarFacturaFisica(): FacturaFisica {
    return {
      _id: "",
      atencion: "",
      calificacion: "",
      categoria: "",
      ciudad: "",
      fechaEmision: this.transformarFecha(new Date()),
      importeTotal: 0,
      numeroFactura: "",
      observaciones: "",
      pais: "",
      provincia: "",
      razonSocial: "",
      urlArchivo: "",
      urlFoto: "",
      user_id: this.usuario.id,
    };
  }
  get FFForm() {
    return this.facFisiForm.controls;
  }
  obtenerPaisOpciones() {
    this.paramService.obtenerListaPadres("PAIS").subscribe((info) => {
      this.paisOpciones = info;
    });
  }
  obtenerProvinciaOpciones() {
    this.paramService
      .obtenerListaHijos(this.facturaFisica.pais, "PAIS")
      .subscribe((info) => {
        this.provinciaOpciones = info;
      });
  }
  obtenerCiudadOpciones() {
    this.paramService
      .obtenerListaHijos(this.facturaFisica.provincia, "PROVINCIA")
      .subscribe((info) => {
        this.ciudadOpciones = info;
      });
  }
  ngOnInit(): void {
    this.tamaniodeArchivo();

    this.facFisiForm = this._formBuilder.group({
      razonSocial: ["", [Validators.required]],
      pais: ["", [Validators.required]],
      provincia: ["", [Validators.required]],
      ciudad: ["", [Validators.required]],
      fechaEmision: ["", [Validators.required]],
      importeTotal: [0, [Validators.required]],
      categoria: ["", [Validators.required]],
      urlFoto: ["", [Validators.required]],
    });
    this.obtenerEmpresaId();
    this.obtenerPaisOpciones();
    this.obtenerProvinciaOpciones();
    this.obtenerCiudadOpciones();
    this.obtenerCategoriaEmpresaOpciones();
    this.fecha = this.transformarFecha(new Date());

    this.usuario = this._coreMenuService.grpPersonasUser;
    this.paramService
      .obtenerParametroNombreTipo("monedas_facturas_elec", "GANAR_SUPERMONEDAS")
      .subscribe((info) => {
        this.ganarMonedasFacElec = info;
        this.superMonedasElec.credito = this.ganarMonedasFacElec.valor;
        this.superMonedasElec.descripcion =
          "Gana " +
          this.ganarMonedasFacElec.valor +
          " supermonedas por subir factura electrónica";
      });
    this.paramService
      .obtenerParametroNombreTipo("monedas_facturas_fisi", "GANAR_SUPERMONEDAS")
      .subscribe((info) => {
        this.ganarMonedasFacFisi = info;
        this.superMonedasFisi.credito = this.ganarMonedasFacFisi.valor;
        this.superMonedasFisi.descripcion =
          "Gana " +
          this.ganarMonedasFacFisi.valor +
          " supermonedas por subir factura física";
      });
    this.cdRef.detectChanges();
  }
  obtenerFechaEmision() {
    this.facturaFisica.fechaEmision = moment(
      this.FFForm.fechaEmision.value[0]
    ).format("YYYY-MM-DD");
  }
  obtenerEmpresaId() {
    this._bienvenidoService
      .obtenerEmpresa({
        nombreComercial: "Global Red Pyme",
      })
      .subscribe(
        (info) => {
          this.superMonedasElec.empresa_id = info._id;
          this.superMonedasFisi.empresa_id = info._id;
        },
        (error) => {
          this.mensaje = "Ha ocurrido un error al actualizar su imagen";
          this.abrirModal(this.mensajeModal);
        }
      );
  }
  ngAfterViewInit() {
    this.iniciarPaginador();
    this.obtenerListaFacturas();
    // this.cdRef.detectChanges();
  }

  toggleSidebar(name): void {
    if (name == "factura-electronica") {
      this.nombreFacElec = "";
      this.archivoFacElec = new FormData();
    } else {
      this.facFisiFormData = new FormData();
      this.facturaFisica = this.inicializarFacturaFisica();
      this.archivoFacturaFisica = "";
    }
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }
  obtenerCategoriaEmpresaOpciones() {
    this.paramService
      .obtenerListaPadres("CATEGORIA_EMPRESA")
      .subscribe((info) => {
        this.categoriaEmpresaOpciones = info;
      });
  }
  subirFacturaElectronica() {
    this._bienvenidoService
      .guardarSuperMonedas(this.superMonedasElec)
      .subscribe((infoSM) => {});
  }
  obtenerListaFacturas() {
    this._misFacturasService
      .obtenerFacturas({
        page: this.page - 1,
        page_size: this.page_size,
        user_id: this.usuario.id,
      })
      .subscribe((info) => {
        this.facturas = info.info;
        this.collectionSize = info.cont;
      });
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, "yyyy-MM-dd");
    return nuevaFecha;
  }
  cargarFacturaElec(event: any) {
    if (event.target.files && event.target.files[0]) {
      let archivo = event.target.files[0];
      let aux = this.sizeFile * 1024 * 1024;

      if (archivo.size > aux) {
        this.mensaje = "Archivo demaciado grande";
        this.abrirModal(this.mensajeModal);
        this.nombreFacElec = "";
        return;
      }
      this.nombreFacElec = archivo.name;
      this.archivoFacElec = new FormData();
      this.archivoFacElec.append(
        "urlArchivo",
        archivo,
        Date.now() + "_" + archivo.name
      );
    }
  }
  visualizarNombreArchivo(nombre) {
    let stringArchivos =
      "https://globalredpymes.s3.amazonaws.com/CENTRAL/archivosFacturas/";
    let stringImagenes =
      "https://globalredpymes.s3.amazonaws.com/CENTRAL/imgFacturas/";
    if (nombre.includes(stringArchivos)) {
      return nombre.replace(
        "https://globalredpymes.s3.amazonaws.com/CENTRAL/archivosFacturas/",
        ""
      );
    } else if (nombre.includes(stringImagenes)) {
      return nombre.replace(
        "https://globalredpymes.s3.amazonaws.com/CENTRAL/imgFacturas/",
        ""
      );
    }
  }
  subirFacturaElec() {
    if (this.nombreFacElec) {
      this.loading = true;
      this.archivoFacElec.append("user_id", this.usuario.id);
      this._misFacturasService.subirFacturaElec(this.archivoFacElec).subscribe(
        (info) => {
          this.obtenerListaFacturas();
          this.toggleSidebar("factura-electronica");

          this._bienvenidoService
            .guardarSuperMonedas(this.superMonedasElec)
            .subscribe(
              (infoSM) => {
                this.loading = false;

                this.mensaje =
                  "Factura cargada con éxito, ud ha ganado " +
                  this.ganarMonedasFacElec.valor +
                  " super monedas";
                this.abrirModal(this.mensajeModal);
              },
              (error) => {
                this.loading = false;
              }
            );
        },
        (error) => {
          this.loading = false;

          this.mensaje = "Ha ocurrido un error al cargar su factura";
          this.abrirModal(this.mensajeModal);
        }
      );
    } else {
      this.loading = false;

      this.mensaje = "Es necesario cargar un archivo tipo PDF o XML";
      this.abrirModal(this.mensajeModal);
    }
  }
  iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaFacturas();
    });
  }
  guardarFacturaFisica() {
    this.submittedFactura = true;
    if (this.facFisiForm.invalid) {
      return;
    }
    let facturaFisicaValores = Object.values(this.facturaFisica);
    let facturaFisicaLlaves = Object.keys(this.facturaFisica);
    facturaFisicaLlaves.map((llaves, index) => {
      if (facturaFisicaValores[index]) {
        if (llaves != "urlFoto") {
          this.facFisiFormData.append(llaves, facturaFisicaValores[index]);
        }
      }
    });
    this.loading = true;
    this._misFacturasService.subirFacturaFisi(this.facFisiFormData).subscribe(
      (info) => {
        this.loading = false;

        this.obtenerListaFacturas();
        this.toggleSidebar("factura-normal");

        this._bienvenidoService
          .guardarSuperMonedas(this.superMonedasFisi)
          .subscribe(
            (infoSM) => {
              this.loading = false;

              this.mensaje =
                "Factura cargada con éxito, ud ha ganado " +
                this.ganarMonedasFacFisi.valor +
                " super monedas";
              this.abrirModal(this.mensajeModal);
            },
            (error) => {
              this.loading = false;
              this.mensaje = "Ha ocurrido un error al cargar su factura";
              this.abrirModal(this.mensajeModal);
            }
          );
      },
      (error) => {
        this.loading = false;
        this.mensaje = "Ha ocurrido un error al cargar su factura";
        this.abrirModal(this.mensajeModal);
      }
    );
  }
  async subirImagen(event) {
    if (event.target.files && event.target.files[0]) {
      let imagen = event.target.files[0];
      let aux = this.sizeFile * 1024 * 1024;

      if (imagen.size > aux) {
        this.mensaje = "Imagen  demaciado grande";
        this.abrirModal(this.mensajeModal);
        this.archivoFacturaFisica = "";
        return;
      }
      this.archivoFacturaFisica = imagen.name;
      this.facFisiFormData.delete("urlFoto");
      this.facFisiFormData.append("urlFoto", imagen, imagen.name);
    }
  }
  abrirModal(modal) {
    this.modalService.open(modal);
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
