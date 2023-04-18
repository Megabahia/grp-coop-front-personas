import { Component, OnInit } from "@angular/core";

import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

import { CoreConfigService } from "@core/services/config.service";
import { PagesViewsService } from "../pages-views/pages-views.service";

@Component({
  selector: "app-mensaje-productos-free",
  templateUrl: "./mensaje-productos-free.component.html",
  styleUrls: ["../pages-views/pages-views.component.scss"],
})
export class MensajeProductosFreeComponent implements OnInit {
  public coreConfig: any;

  // Private
  private _unsubscribeAll: Subject<any>;
  public productos;
  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private _coreConfigService: CoreConfigService,

    private _pages_viewsService: PagesViewsService
  ) {
    this.listarProductos();
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true,
        },
        footer: {
          hidden: true,
        },
        menu: {
          hidden: true,
        },
        customizer: false,
        enableLocalStorage: false,
      },
    };
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to config changes
    this._coreConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.coreConfig = config;
      });
  }

  listarProductos() {
    this._pages_viewsService
      .getlistaProductosfree({ tipo: "producto-nuestra-familia-sm" })
      .subscribe(
        (data) => {
          this.productos = data.info;
        },
        (error) => {
          /*      this.mensaje = "Error al cargar productos";
          this.abrirModal(this.mensajeModal); */
        }
      );
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
