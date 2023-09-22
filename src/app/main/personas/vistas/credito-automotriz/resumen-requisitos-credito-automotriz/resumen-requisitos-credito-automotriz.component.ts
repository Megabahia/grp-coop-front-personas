import {Component, OnInit, ViewChild} from '@angular/core';
import {ParametrizacionesService} from '../../../servicios/parametrizaciones.service';
import {SolicitarCredito} from '../../../models/persona';
import {CoreMenuService} from '../../../../../../@core/components/core-menu/core-menu.service';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../../../@core/services/config.service';
import {Subject} from 'rxjs';
import {jsPDF} from 'jspdf';
import {CreditoAutomotrizService} from '../credito-automotriz.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-resumen-requisitos-credito-automotriz',
    templateUrl: './resumen-requisitos-credito-automotriz.component.html',
    styleUrls: ['./resumen-requisitos-credito-automotriz.component.scss']
})
export class ResumenRequisitosCreditoAutomotrizComponent implements OnInit {
    @ViewChild('modalAviso') modalAviso;
    public mensaje = '';
    public plazo = 12;
    public formulario: FormGroup;
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;
    public solicitarCredito;
    public coutaMensual;
    public montoCreditoFinal;
    public valorMinimo;
    public requisitos = {
        valor: '',
        config: [],
        nombre: '',
        _id: ''
    };
    public descripcion = {
        valor: '',
        config: [],
        nombre: '',
        _id: ''
    };
    public tipoPersona;
    private usuario: any;
    public checks;
    public soltero = false;
    public tiposNormales = {
        'Credito Automotriz Empleado': 'Credito Automotriz Empleado',
        'Credito Automotriz Alfa': 'null'
    };
    public tiposPreaprobados = {
        'Credito Automotriz Empleado': 'Credito Automotriz Empleado-PreAprobado',
        'Credito Automotriz Alfa': 'null'
    };

    constructor(
        private _router: Router,
        private paramService: ParametrizacionesService,
        private _creditosAutomotrizService: CreditoAutomotrizService,
        private _coreMenuService: CoreMenuService,
        private _coreConfigService: CoreConfigService,
        private modalService: NgbModal,
    ) {
        this._unsubscribeAll = new Subject();
        this.usuario = this._coreMenuService.grpPersonasUser;
        this.coutaMensual = localStorage.getItem('coutaMensual');
        this.montoCreditoFinal = localStorage.getItem('montoCreditoFinal');
        const casados = ['UNIÓN LIBRE', 'CASADO'];
        let tipoPersona;
        let estadoCivil;
        if (localStorage.getItem('tipoPersona') === 'Empleado') {
            tipoPersona = 'EMPLEADO';
        } else if (localStorage.getItem('tipoPersona') === 'Negocio propio') {
            tipoPersona = 'NEGOCIOS';
        } else {
            tipoPersona = 'ALFA';
        }
        if (casados.find(item => item === localStorage.getItem('estadoCivil').toUpperCase())) {
            estadoCivil = 'CASADO';
        } else {
            estadoCivil = 'SOLTERO';
            this.soltero = true;
        }
        this.tipoPersona = `CREDITO_AUTOMOTRIZ_REQUISITOS_${tipoPersona}_${estadoCivil}_CREDICOMPRA`;
        this.formulario = new FormGroup({
            monto: new FormControl(this.montoCreditoFinal, [
                Validators.required, Validators.pattern('^([0-9])+$'), Validators.max(this.montoCreditoFinal)
            ]),
        });
    }

    ngOnInit(): void {
        this.getInfo();
        if (localStorage.getItem('credito') !== null) {
            this.solicitarCredito = JSON.parse(localStorage.getItem('credito'));
            this.solicitarCredito.canal = this.tiposPreaprobados['Credito Automotriz ' + localStorage.getItem('tipoPersona')] || 'Credito Automotriz Negocio-PreAprobado';
            this.solicitarCredito.tipoCredito = this.tiposPreaprobados['Credito Automotriz ' + localStorage.getItem('tipoPersona')] === 'null' ? 'null' : 'Credito Automotriz Negocio-PreAprobado';
        } else {
            this.solicitarCredito = this.inicialidarSolicitudCredito();
        }
        // Subscribe to config changes
        this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.coreConfig = config;
        });
    }

    inicialidarSolicitudCredito(): SolicitarCredito {
        return {
            _id: '',
            aceptaTerminos: 0,
            empresaComercial_id: '',
            empresaIfis_id: '',
            estado: 'Nuevo',
            monto: this.montoCreditoFinal,
            cuota: this.coutaMensual,
            plazo: 12,
            user_id: this.usuario.id,
            canal: this.tiposNormales['Credito Automotriz ' + localStorage.getItem('tipoPersona')] === 'null' ? 'Credito Automotriz ' + localStorage.getItem('tipoPersona') : this.tiposNormales['Credito Automotriz ' + localStorage.getItem('tipoPersona')] || 'Credito Automotriz Negocio propio',
            tipoCredito: this.tiposNormales['Credito Automotriz ' + localStorage.getItem('tipoPersona')] || 'Credito Automotriz Negocio propio',
            concepto: this.tiposNormales['Credito Automotriz ' + localStorage.getItem('tipoPersona')] === 'null' ? 'Credito Automotriz ' + localStorage.getItem('tipoPersona') : this.tiposNormales['Credito Automotriz ' + localStorage.getItem('tipoPersona')] || 'Credito Automotriz Negocio propio',
            cargarOrigen: 'IFIS',
            nombres: '',
            apellidos: '',
            numeroIdentificacion: '',
            user: '',
            alcance: 'LOCAL',
        };
    }

    getInfo() {
        this.paramService.obtenerListaPadresSinToken(this.tipoPersona).subscribe((info) => {
            this.requisitos = info[0];
            this.checks = this.requisitos.config.map(item => {
                return {'label': item, 'valor': false };
            });
            this.checks.push({'label': 'Autorización y validación de información', 'valor': true});
        });
        this.paramService.obtenerListaPadresSinToken('CREDITO_AUTOMOTRIZ_TITULO_REQUISITOS_CREDICOMPRA_ULTIMA_PANTALLA')
            .subscribe((info) => {
            this.descripcion = info[0];
            this.descripcion.valor = this.descripcion.valor.replace('${{montoCreditoFinal}}', this.montoCreditoFinal);
            this.descripcion.valor = this.descripcion.valor.replace('${{coutaMensual}}', this.coutaMensual);
        });
        this.paramService.obtenerListaPadresSinToken('VALOR_MINIMO_SOLICITAR_CREDITO_AUTOMOTRIZ').subscribe((info) => {
            this.valorMinimo = info[0].valor;
            this.formulario.get('monto').setValidators([
                Validators.required, Validators.pattern('^([0-9])+$'),
                Validators.max(this.montoCreditoFinal), Validators.min(this.valorMinimo)
            ]);
            this.formulario.get('monto').updateValueAndValidity();
        });
        this.paramService.obtenerParametroNombreTipo('TIEMPO_PLAZO', 'VALORES_CALCULAR_CREDITO_CREDICOMPRA').subscribe((info) => {
            this.plazo = info.valor;
        });
    }
    abrirModalLg(modal) {
        this.modalService.open(modal, {
            size: 'lg'
        });
    }

    guardarCredito() {
        if (this.formulario.invalid) {
            this.mensaje = 'El valor ingresado no es permitido';
            this.abrirModalLg(this.modalAviso);
            return;
        }
        this.solicitarCredito.monto = this.Form.monto.value;
        // Agregar informacion al credito
        this.solicitarCredito.nombres = this.usuario.persona.nombres;
        this.solicitarCredito.apellidos = this.usuario.persona.apellidos;
        this.solicitarCredito.numeroIdentificacion = this.usuario.persona.identificacion;
        this.solicitarCredito.estadoCivil = this.usuario.persona.estadoCivil;
        this.solicitarCredito.empresaInfo = {};
        this.solicitarCredito.cuota = this.solicitarCredito.cuota ? this.solicitarCredito.cuota : this.coutaMensual;
        this.solicitarCredito.user = this.usuario.persona ? this.usuario.persona : JSON.parse(localStorage.getItem('grpPersonasUser')).persona;
        this.solicitarCredito.checks = this.checks;
        if (localStorage.getItem('credito')) {
            this._creditosAutomotrizService.updateCredito(this.solicitarCredito).subscribe((info) => {
                this.continue(info._id);
            });
        } else {
            this._creditosAutomotrizService.crearCredito(this.solicitarCredito).subscribe((info) => {
                this.continue(info._id);
            });
        }
    }
    get Form() {
        return this.formulario.controls;
    }

    continue(_id: any) {
        const doc = new jsPDF();
        const text = `Al autorizar el tratamiento de su información, usted acepta que la empresa Corporación OmniGlobal y todas sus marcas y/o productos a validar su información en las plataformas pertinentes.
        Al autorizar el tratamiento de su información, usted acepta que la empresa revise su información de Buró de Crédito para confirmar su estado crediticio.`;
        const x = 10;
        const y = 10;
        const maxWidth = 180; // Ancho máximo del párrafo
        doc.text(text, x, y, {maxWidth});
        // Convierte el documento en un archivo Blob
        const pdfBlob = doc.output('blob');
        // Crea un objeto FormData y agrega el archivo Blob
        const formData: FormData = new FormData();
        formData.append('autorizacion', pdfBlob, 'autorizacion.pdf');
        formData.append('_id', _id);
        this._creditosAutomotrizService.updateCreditoFormData(formData).subscribe(() => {
            localStorage.clear();
            this._router.navigate([
                `/personas/creditos-autonomos/validacion-datos`,
            ]);
        });
    }
}
