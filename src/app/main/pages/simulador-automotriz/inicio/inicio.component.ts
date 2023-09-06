import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CoreConfigService} from '../../../../../@core/services/config.service';

@Component({
    selector: 'app-inicio',
    template: `
        <div class="row justify-content-center">
            <section class="text-LP">
                <div class="container pb-5">
                    <div class="row justify-content-center align-items-center">
                        <div class="col-md-12 text-center ">
                            <img class="my-3" src="/assets/images/logo/logos-png.png" width="250" alt="">
                        </div>
                        <div class="col-md-12 text-center">
                            <div class="justify-content-center row mx-2 mb-5">
                                <p class="text-center ">
                                    <b>
                                        Realiza compras de productos de varias categorías en los mejores Locales Comerciales
                                        afiliados a <a href="https://credicompra.com/" target="_blank"
                                                       style="color: #f2d81d !important;">credicompra.com</a> a través de un
                                        CRÉDITO otorgado por una Cooperativa de Ahorro y Crédito regulada.
                                    </b>
                                </p><br>
                                <p class="text-center">
                                    <b>Tú crédito en 3 simples pasos:</b>
                                </p>
                            </div>
                            <div class="row mx-2 mb-3">
                                <div class="col col-4">Paso 1. Simula tu crédito</div>
                                <div class="col col-4">Paso 2. Llena tus datos</div>
                                <div class="col col-4">Paso 3. Accede a tu crédito</div>
                            </div>
                            <div class="row mx-2 text-center d-flex justify-content-center">
                                <div class="col col-6 ">
                                    <button class=" float-right btn btn-primary mb-sm-0 mr-0 mr-sm-1"
                                            style="color: black !important;"
                                            routerLink="/pages/credito-automotriz/simulador">
                                        Continuar
                                    </button>
                                </div>
                                <div class="col col-sm-6 ">
                                    <a href="https://credicompra.com/">
                                        <button class="float-left btn btn-primary mb-sm-0 mr-0 mr-sm-1"
                                                style="color: black !important;">
                                            Cancelar
                                        </button>
                                    </a>
                                </div>

                                <!-- Need-info -->
                                <app-need-info [href]="'https://wa.link/bqfcnh'"></app-need-info>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <app-footer></app-footer>

        <!-- Buynow Button-->
        <app-need-help [href]="'https://walink.co/9e8a9d'"></app-need-help>
    `,
    styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

    constructor(
        private _router: Router,
        private _coreConfigService: CoreConfigService,
    ) {
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
        // Verificar dominio pagina
        const ref = document.referrer;
        const host = document.location.host;
        console.log('ref', ref, 'host', host);
        // if (ref !== 'https://credicompra.com/') {
        //   if (host !== '209.145.61.41:4201') {
        //     this._router.navigate([
        //       `/grp/login`,
        //     ]);
        //     localStorage.clear();
        //     return;
        //   }
        // }
        // localStorage.setItem('pagina', ref);
        localStorage.setItem('pagina', 'https://credicompra.com/');
    }

    ngOnInit(): void {
    }

}
