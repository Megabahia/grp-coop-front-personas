import { Component, OnInit, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { CompartirPublicacionesService } from "./compartir-publicaciones.service";
import { DatePipe } from "@angular/common";
import { CoreMenuService } from "../../../../../../@core/components/core-menu/core-menu.service";
import { ParametrizacionesService } from "app/main/personas/servicios/parametrizaciones.service";
import { GanarSuperMoneda } from "app/main/personas/models/supermonedas";
import { BienvenidoService } from "../../bienvenido/bienvenido.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-compartir-publicaciones",
  templateUrl: "./compartir-publicaciones.component.html",
  styleUrls: ["./compartir-publicaciones.component.scss"],
  providers: [DatePipe],
})
export class CompartirPublicacionesComponent implements OnInit {
  @ViewChild("mensajeModal") mensajeModal;

  public page = 1;
  public page_size: any = 10;
  public maxSize;
  public collectionSize;
  public publicaciones;
  public usuario;
  private _unsubscribeAll: Subject<any>;
  public ganarMonedasFacElec;
  public superMonedasElec: GanarSuperMoneda;
  public empresaId;
  public mensaje = "";

  constructor(
    private modalService: NgbModal,

    private _coreMenuService: CoreMenuService,
    private paramService: ParametrizacionesService,
    private _bienvenidoService: BienvenidoService,

    private _compartirPublicacionesService: CompartirPublicacionesService,
    private datePipe: DatePipe
  ) {
    this._unsubscribeAll = new Subject();
    this.usuario = this._coreMenuService.grpPersonasUser;
    this.superMonedasElec = this.inicializarSuperMoneda();
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

  ngOnInit(): void {
    this.paramService
      .obtenerParametroNombreTipo(
        "monedas_compartir_publicaciones+",
        "GANAR_SUPERMONEDAS"
      )
      .subscribe((info) => {
        this.ganarMonedasFacElec = info;
        this.superMonedasElec.credito = this.ganarMonedasFacElec.valor;
        this.superMonedasElec.descripcion =
          "Gana " +
          this.ganarMonedasFacElec.valor +
          " por publicación en Facebook";
      });
    this.obtenerIdEm();
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }

  obtenerIdEm() {
    this._bienvenidoService
      .obtenerEmpresa({
        nombreComercial: "Global Red Pyme",
      })
      .subscribe(
        (info) => {
          this.superMonedasElec.empresa_id = info._id;
        },
        (error) => {
          this.mensaje = "Ha ocurrido un error";
          this.abrirModal(this.mensajeModal);
        }
      );
  }
  ngAfterViewInit() {
    this.obtenerListaPublicaciones();
  }

  obtenerListaPublicaciones() {
    this._compartirPublicacionesService
      .obtenerPublicaciones({
        user_id: this.usuario.id,
      })
      .subscribe((info) => {
        this.publicaciones = info.info;
        this.collectionSize = info.cont;
      });
  }
  obtenerEvento(evento, id) {
    this._bienvenidoService
      .guardarSuperMonedas(this.superMonedasElec)
      .subscribe(
        (infoSM) => {
          //  this.loading = false;

          this.mensaje =
            "Compartido con éxito, ud ha ganado " +
            this.ganarMonedasFacElec.valor +
            " super monedas";
          this.abrirModal(this.mensajeModal);
        },
        (error) => {
          /*  this.loading = false; */
        }
      );

    //
    this.compartirPublicacion(id);

    console.log(evento);
  }
  abrirModal(modal) {
    this.modalService.open(modal);
  }
  obtenerMes(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, "MMM");
    return nuevaFecha;
  }
  obtenerDia(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, "d");
    return nuevaFecha;
  }
  compartirPublicacion(id) {
    this._compartirPublicacionesService
      .guardarPublicacion({
        user: this.usuario.id,
        publicacion: id,
      })
      .subscribe((info) => {
        this.obtenerListaPublicaciones();
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
