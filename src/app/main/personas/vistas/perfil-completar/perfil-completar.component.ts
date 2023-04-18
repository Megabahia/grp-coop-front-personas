import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {ParametrizacionesService} from '../../servicios/parametrizaciones.service';
import {PerfilUsuarioService} from '../../../center/perfil-usuario/perfil-usuario.service';
import {User} from '../../../../auth/models';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';
import {Router} from '@angular/router';
import {BienvenidoService} from '../bienvenido/bienvenido.service';

@Component({
    selector: 'app-perfil-completar',
    templateUrl: './perfil-completar.component.html',
    styleUrls: ['./perfil-completar.component.scss']
})
export class PerfilCompletarComponent implements OnInit {

    // Configuraciones
    private _unsubscribeAll: Subject<any>;
    public coreConfig: any;
    // Variables
    public submitted = false;
    public ganarMonedas;
    public estadoCivil = false;
    public listadoEstadoCivil;
    public registerForm: FormGroup;
    public usuario: User;

    constructor(
        private _coreConfigService: CoreConfigService,
        private _formBuilder: FormBuilder,
        private paramService: ParametrizacionesService,
        private _perfilUsuarioService: PerfilUsuarioService,
        private _coreMenuService: CoreMenuService,
        private _bienvenidoService: BienvenidoService,
        private router: Router,
    ) {
        this._unsubscribeAll = new Subject();
        // Configure the layout
        this._coreConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                menu: {
                    hidden: true
                },
                customizer: false,
                enableLocalStorage: false
            }
        };
    }

    get f() {
        return this.registerForm.controls;
    }

    ngOnInit(): void {
        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
        this.paramService.obtenerParametroNombreTipo('monedas_registro', 'GANAR_SUPERMONEDAS').subscribe((info) => {
            this.ganarMonedas = info;
            // this.superMonedas.credito = this.ganarMonedas.valor;
            // this.superMonedas.descripcion = 'Gana ' + this.ganarMonedas.valor + ' supermonedas por completar perfil';
        });
        this.paramService.obtenerListaPadresSinToken('ESTADO_CIVIL').subscribe((info) => {
            this.listadoEstadoCivil = info;
        });
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.iniciarFormGroup();
    }

    iniciarFormGroup() {
        this.registerForm = this._formBuilder.group({
            user_id: [this.usuario.id],
            nombres: ['', [Validators.required]],
            celularRepresentante: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
            estadoCivil: ['', [Validators.required]],
            ingresosConyuge: [0],
            identificacion: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(13), Validators.pattern('^[0-9]*$')]],
            whatsappRepresentante: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
            correoRepresentante: ['', [Validators.required, Validators.email]],
        });
    }

    subirImagen(event: any) {
        // if (event.target.files && event.target.files[0]) {
        //     let nuevaImagen = event.target.files[0];
        //     let imagen = new FormData();
        //     imagen.append('imagen', nuevaImagen, nuevaImagen.name);
        //     this._completarPerfilService.subirImagenRegistro(this.usuario.id, imagen).subscribe((info) => {
        //             let reader = new FileReader();
        //
        //             reader.onload = (event: any) => {
        //                 this.imagen = event.target.result;
        //             };
        //
        //             reader.readAsDataURL(event.target.files[0]);
        //             this.mensaje = "Imagen actualizada con éxito";
        //             this.abrirModal(this.mensajeModal);
        //         },
        //         (error) => {
        //             this.mensaje = "Ha ocurrido un error al actualizar su imagen";
        //             this.abrirModal(this.mensajeModal);
        //         });
        // }
    }

    verificarEstadoCivil() {
        if (this.registerForm.value['estadoCivil'].toUpperCase() === 'CASADO'
            || this.registerForm.value['estadoCivil'].toUpperCase() === 'UNIÓN LIBRE') {
            this.registerForm.get('ingresosConyuge').setValidators(Validators.required);
            this.registerForm.get('ingresosConyuge').setErrors({'required': true});
            this.registerForm.get('ingresosConyuge').setValue(null);
            this.estadoCivil = true;
        } else {
            this.registerForm.get('ingresosConyuge').setValidators(null);
            this.registerForm.get('ingresosConyuge').setErrors(null);
            this.registerForm.get('ingresosConyuge').setValue(0);
            this.estadoCivil = false;
        }
    }

    guardarRegistro() {
        this.submitted = true;
        if (this.registerForm.invalid) {
            console.log(this.registerForm);
            return;
        }
        console.log('paso');
        this._perfilUsuarioService
            .guardarInformacion(this.registerForm.value)
            .subscribe(
                (info) => {
                    // if (info.error) {
                    //     // this.abrirModal(info.error);
                    //     this.mensaje = info.error;
                    //     this.abrirModal(this.mensajeModal);
                    //     return;
                    // }
                    this._bienvenidoService.cambioDeEstado(
                        {
                            estado: '5',
                            id: this.usuario.id
                        }
                    ).subscribe(infoCambio => {
                            this.usuario.estado = '5';
                            this.usuario.persona = info;
                            console.log('entro');
                            localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
                            this.router.navigate(['/grp/perfil']);

                        },
                        (error) => {
                            // this.mensaje = "Ha ocurrido un error ";
                            // this.abrirModal(this.mensajeModal);
                        });


                    // if (this.usuario.persona) {
                    //     this.disabledVal = 'disabled';
                    // }
                    // localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
                    // if (!this.validado) {
                    //     this.mensaje =
                    //         'Información guardada correctamente<br>Es necesario validar el usuario';
                    //     this.abrirModal(this.mensajeModal);
                    // } else {
                    //     this.mensaje = 'Información guardada correctamente';
                    //     this.abrirModal(this.mensajeModal);
                    // }
                },
                (error) => {
                    // this.mensaje =
                    //     'Error al guardar la información, verifique que la información sea la correcta';
                    // this.abrirModal(this.mensajeModal);
                }
            );

        console.log('se envio');
    }

}
