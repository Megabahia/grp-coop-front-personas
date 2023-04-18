import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {PerfilUsuarioService} from './perfil-usuario.service';
import {User} from '../../../auth/models/user';
import {CoreMenuService} from '../../../../@core/components/core-menu/core-menu.service';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {
    InformacionBasica,
    HistorialLaboral,
} from '../../personas/models/persona';
import {DatePipe} from '@angular/common';
import moment from 'moment';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BienvenidoService} from '../../personas/vistas/bienvenido/bienvenido.service';
import {Router} from '@angular/router';
import {ParametrizacionesService} from '../../personas/servicios/parametrizaciones.service';

@Component({
    selector: 'app-perfil-usuario',
    templateUrl: './perfil-usuario.component.html',
    styleUrls: ['./perfil-usuario.component.scss'],
    providers: [DatePipe],
})
export class PerfilUsuarioComponent implements OnInit, OnDestroy {
    @ViewChild('mensajeModal') mensajeModal;

    public PerfilSub = false;

    public submitted = false;
    public tab;
    public usuario: User;
    public coreConfig: any;
    public personaForm: FormGroup;
    public datosTrabajo: HistorialLaboral;
    public datosTrabajoForm: FormGroup;
    public datosRepresentanteForm: FormGroup;
    public informacionBasica: InformacionBasica;
    public persona;
    public imagen;
    public mensaje = '';
    public imagenTemp;
    public fecha;
    public validado = false;
    public startDateOptions: FlatpickrOptions = {
        altInput: true,
        mode: 'single',
        altFormat: 'Y-n-j',
        altInputClass:
            'form-control flat-picker flatpickr-input invoice-edit-input',
    };
    public paisOpciones;
    public provinciaOpciones;
    public ciudadOpciones;
    public profesionOpciones;
    public listadoEstadoCivil;
    private disabledVal = 'disabled';
    // Private
    private _unsubscribeAll: Subject<any>;
    private estadoCivil = false;
    public casado = false;

    constructor(
        private _perfilUsuarioService: PerfilUsuarioService,
        private _coreMenuService: CoreMenuService,
        private _formBuilder: FormBuilder,
        private datePipe: DatePipe,
        private _modalService: NgbModal,
        private _bienvenidoService: BienvenidoService,
        private _router: Router,
        private paramService: ParametrizacionesService
    ) {
        this.informacionBasica = {
            pais: '',
            provincia: '',
            ciudad: '',
            edad: 0,
            emailAdicional: '',
            facebook: '',
            fechaNacimiento: '',
            genero: '',
            instagram: '',
            tiktok: '',
            twitter: '',
            telefono: '',
            whatsapp: '',
            youtube: '',
            user_id: '',
        };
        this.datosTrabajo = {
            fechaInicio: '',
            imagen: '',
            nombreEmpresa: '',
            tiempoTrabajo: 0,
            cargoActual: '',
            profesion: '',
            _id: '',
        };
        this._unsubscribeAll = new Subject();
    }

    get f() {
        return this.personaForm.controls;
    }

    get tForm() {
        return this.datosTrabajoForm.controls;
    }

    ngOnInit(): void {
        this.personaForm = this._formBuilder.group({
            created_at: [''],
            identificacion: [
                '',
                [Validators.required, Validators.pattern('^[0-9]+001$'),
                    Validators.maxLength(13), Validators.minLength(13),
                ],
            ],
            nombres: ['', [Validators.required]],
            apellidos: ['', [Validators.required]],
            genero: ['', [Validators.required]],
            fechaNacimiento: ['', [Validators.required]],
            estadoCivil: ['', [Validators.required]],
            cedulaRepresentante: ['', [Validators.required]],
            direccionRepresentante: ['', [Validators.required]],
            celularRepresentante: ['', [Validators.required]],
            whatsappRepresentante: ['', [Validators.required]],
            correoRepresentante: ['', [Validators.required]],
            edad: ['', [Validators.required]],
            whatsapp: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.maxLength(10),
                    Validators.minLength(10),
                    Validators.min(1),
                ],
            ],
            telefono: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.maxLength(10),
                    Validators.minLength(10),
                    Validators.min(1),
                ],
            ],
            pais: ['', [Validators.required]],
            provincia: ['', [Validators.required]],
            ciudad: ['', [Validators.required]],
            email: ['', [Validators.required]],
            emailAdicional: ['', [Validators.email]],
            facebook: [''],
            instagram: [''],
            twitter: [''],
            tiktok: [''],
            youtube: [''],
        });
        this.datosTrabajoForm = this._formBuilder.group({
            ruc: ['', [Validators.required, Validators.pattern('^[0-9]+001$'),
                Validators.maxLength(13), Validators.minLength(13),
            ]],
            nombreEmpresa: ['', [Validators.required]],
            direccionEmpresa: ['', [Validators.required]],
            telefonoEmpresa: ['', [
                Validators.required,
                Validators.pattern('^[0-9]*$')]],
        });
        this.usuario = this._coreMenuService.grpPersonasUser;
        this._perfilUsuarioService
            .obtenerInformacion(this.usuario.id)
            .subscribe((info) => {
                this.imagen = info.imagen;
                if (info.identificacion) {
                    this.validado = true;
                }
                info.created_at = this.transformarFecha(info.created_at);
                info.fechaNacimiento = this.transformarFecha(info.fechaNacimiento);

                if (typeof info.whatsapp !== 'undefined') {
                    info.whatsapp = info.whatsapp ? info.whatsapp.replace('+593', 0) : '';
                }

                this.datosTrabajoForm.patchValue(info.datosPyme);

                this.fecha = this.transformarFecha(info.fechaNacimiento);
                this.personaForm.patchValue(info);
                this.obtenerPaisOpciones();
                this.obtenerProvinciaOpciones();
                this.obtenerCiudadOpciones();
                this.obtenerProfesionOpciones();
            });
        // this._perfilUsuarioService
        //     .obtenerHistorialLaboral(this.usuario.id)
        //     .subscribe((info) => {
        //         this.datosTrabajo = info;
        //         this.datosTrabajoForm.patchValue(info);
        //     });
        this.paramService.obtenerListaPadresSinToken('ESTADO_CIVIL').subscribe((info) => {
            this.listadoEstadoCivil = info;
        });
    }

    verificarEstadoCivil() {
        if (this.personaForm.value['estadoCivil'].toUpperCase() === 'CASADO'
            || this.personaForm.value['estadoCivil'].toUpperCase() === 'UNIÓN LIBRE') {
            this.personaForm.get('ingresosConyuge').setValidators(Validators.required);
            this.personaForm.get('ingresosConyuge').setErrors({'required': true});
            this.personaForm.get('ingresosConyuge').setValue(null);
            this.estadoCivil = true;
        } else {
            this.personaForm.get('ingresosConyuge').setValidators(null);
            this.personaForm.get('ingresosConyuge').setErrors(null);
            this.personaForm.get('ingresosConyuge').setValue(0);
            this.estadoCivil = false;
        }
    }

    transformarFecha(fecha) {
        const nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
        return nuevaFecha;
    }

    omitirContinuar() {
        const usuario = this._coreMenuService.grpPersonasUser;
        this._bienvenidoService
            .cambioDeEstado({
                estado: '6',
                id: usuario.id,
            })
            .subscribe((info) => {
                usuario.estado = '6';
                localStorage.setItem('grpPersonasUser', JSON.stringify(usuario));
                setTimeout(() => {
                    window.location.href = '/';
                }, 100);
            });

        // redirect to home page
    }

    guardarInformacion() {
        this.PerfilSub = true;
        if (this.personaForm.invalid) {
            return;
        }
        let wppAux = '';

        this.informacionBasica = {
            ...this.personaForm.value,
            fechaNacimiento: this.informacionBasica.fechaNacimiento,
        };
        this.informacionBasica.user_id = this.usuario.id;
        if (!this.informacionBasica.fechaNacimiento) {
            delete this.informacionBasica.fechaNacimiento;
        }
        if (!this.informacionBasica.whatsapp) {
            delete this.informacionBasica.whatsapp;
        }
        this.informacionBasica.whatsapp = this.f.whatsapp.value;
        wppAux += '+593' + this.f.whatsapp.value.substring(1, 10);
        this.informacionBasica.whatsapp = wppAux;
        this._perfilUsuarioService
            .guardarInformacion(this.informacionBasica)
            .subscribe(
                (info) => {
                    if (info.error) {
                        // this.abrirModal(info.error);
                        this.mensaje = info.error;
                        this.abrirModal(this.mensajeModal);
                        return;
                    }
                    this.usuario.persona = info;
                    if (this.usuario.persona) {
                        this.disabledVal = 'disabled';
                    }
                    localStorage.setItem('grpPersonasUser', JSON.stringify(this.usuario));
                    if (!this.validado) {
                        this.mensaje =
                            'Información guardada correctamente<br>Es necesario validar el usuario';
                        this.abrirModal(this.mensajeModal);
                    } else {
                        this.mensaje = 'Información guardada correctamente';
                        this.abrirModal(this.mensajeModal);
                    }
                },
                (error) => {
                    this.mensaje =
                        'Error al guardar la información, verifique que la información sea la correcta';
                    this.abrirModal(this.mensajeModal);
                }
            );
    }

    calcularEdad() {
        this.informacionBasica.edad = moment().diff(
            this.f.fechaNacimiento.value[0],
            'years'
        );
        this.informacionBasica.fechaNacimiento = moment(
            this.f.fechaNacimiento.value[0]
        ).format('YYYY-MM-DD');
        this.personaForm.patchValue({
            edad: this.informacionBasica.edad,
        });
        if (this.informacionBasica.edad < 18) {
            this.personaForm.get('fechaNacimiento').setErrors({valid: false});
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    async subirImagen(event) {
        if (event.target.files && event.target.files[0]) {
            const imagen = event.target.files[0];
            const nuevaImagen = new FormData();
            nuevaImagen.append('imagen', imagen, imagen.name);

            this._perfilUsuarioService
                .guardarImagen(nuevaImagen, this.usuario.id)
                .subscribe(
                    (data) => {
                        const reader = new FileReader();

                        reader.onload = (event: any) => {
                            this.imagenTemp = event.target.result;
                        };

                        reader.readAsDataURL(event.target.files[0]);
                        this.mensaje = 'Imagen guardada correctamente';
                        this.abrirModal(this.mensajeModal);
                    },
                    (error) => {
                        this.mensaje = 'Error al guardar imagen';
                        this.abrirModal(this.mensajeModal);
                    }
                );
        }
    }

    abrirModal(modal) {
        this._modalService.open(modal);
    }

    cerrarModal() {
        this._modalService.dismissAll();
    }

    obtenerPaisOpciones() {
        this.paramService.obtenerListaPadres('PAIS').subscribe((info) => {
            this.paisOpciones = info;
        });
    }

    obtenerProvinciaOpciones() {
        this.paramService
            .obtenerListaHijos(this.informacionBasica.pais, 'PAIS')
            .subscribe((info) => {
                this.provinciaOpciones = info;
            });
    }

    obtenerCiudadOpciones() {
        this.paramService
            .obtenerListaHijos(this.informacionBasica.provincia, 'PROVINCIA')
            .subscribe((info) => {
                this.ciudadOpciones = info;
            });
    }

    obtenerProfesionOpciones() {
        this.paramService.obtenerListaPadres('PROFESIONES').subscribe((info) => {
            this.profesionOpciones = info;
        });
    }

    guardarDatosTrabajo() {
        this.submitted = true;
        if (this.datosTrabajoForm.invalid) {
            return;
        }
        console.log(this.datosTrabajo);
        console.log(this.datosTrabajoForm);
        this.personaForm.controls['fechaNacimiento'].setValue(this.transformarFecha(this.personaForm.get('fechaNacimiento').value[0]));
        this._perfilUsuarioService
            .guardarHistorialLaboral(this.usuario.id, {
                user_id: this.usuario.id,
                ...this.personaForm.value,
                datosPyme: this.datosTrabajoForm.value
            })
            .subscribe(
                (info) => {
                    this.datosTrabajo = info;
                    this.datosTrabajoForm.patchValue(info.datosPyme);
                    console.log('datosTrabajo', this.datosTrabajo);
                    // localStorage.setItem("grpPersonasUser", JSON.stringify(this.usuario));
                    if (!this.validado) {
                        this.mensaje =
                            'Información guardada correctamente<br>Es necesario validar el usuario';
                        this.abrirModal(this.mensajeModal);
                    } else {
                        this.mensaje = 'Información guardada correctamente';
                        this.abrirModal(this.mensajeModal);
                    }
                },
                (error) => {
                    this.mensaje =
                        'Error al guardar la información, verifique que la información sea la correcta';
                    this.abrirModal(this.mensajeModal);
                }
            );
    }
}
