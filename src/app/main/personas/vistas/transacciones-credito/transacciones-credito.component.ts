import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {User} from '../../../../auth/models';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {takeUntil} from 'rxjs/operators';
import {TransaccionesCreditoService} from './transacciones-credito.service';

/**
 * COOP
 * PErsonas
 * Esta pantalla sirve para mostrar las transacciones de los creditos
 * Rutas:
 * `${environment.apiUrl}/corp/movimientoCobros/list/transacciones`,
 */

@Component({
    selector: 'app-transacciones-credito',
    templateUrl: './transacciones-credito.component.html',
    styleUrls: ['./transacciones-credito.component.scss'],
})
export class TransaccionesCreditoComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(NgbPagination) paginator: NgbPagination;
    public page = 1;
    public page_size: any = 10;
    public maxSize;
    public collectionSize;
    public coreConfig: any;
    public usuario: User;
    public listaMovimientos;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _coreMenuService: CoreMenuService,
        private _transaccionesCreditoService: TransaccionesCreditoService,
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.usuario = this._coreMenuService.grpPersonasUser;
        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
        this.obtenerListaCreditos();
    }

    ngAfterViewInit(): void {
    }

    iniciarPaginador() {
        this.paginator.pageChange.subscribe(() => {
            this.obtenerListaCreditos();
        });
    }

    obtenerListaCreditos() {
        this._transaccionesCreditoService.obtenerListaMovimientos({
            page: this.page - 1,
            page_size: this.page_size,
            creditoPersonas_id: '',
        }).subscribe((info) => {
            this.listaMovimientos = info.info;
            this.collectionSize = info.cont;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
