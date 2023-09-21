import {Component, OnInit, ViewChild} from '@angular/core';
import {ParametrizacionesService} from '../../../servicios/parametrizaciones.service';
import {CreditosAutonomosService} from '../creditos-autonomos.service';
import {SolicitarCredito} from '../../../models/persona';
import {CoreMenuService} from '../../../../../../@core/components/core-menu/core-menu.service';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../../../@core/services/config.service';
import {Subject} from 'rxjs';
import {jsPDF} from 'jspdf';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-resumen-requisitos-credito',
    templateUrl: './resumen-requisitos-credito.component.html',
    styleUrls: ['./resumen-requisitos-credito.component.scss']
})
export class ResumenRequisitosCreditoComponent implements OnInit {
    @ViewChild('modalAviso') modalAviso;
    public mensaje = '';
    public plazo = 12;
    public formulario: FormGroup;
    public valorMinimo;
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;
    public solicitarCredito;
    public coutaMensual;
    public montoCreditoFinal;
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
    public checksNegocio = [
        {'label': 'Copia de cédula', 'valor': false},
        {'label': 'Copia de Ruc', 'valor': false},
        {'label': 'Papeleta de votación', 'valor': false},
        {'label': 'Identificacion conyuge', 'valor': false},
        {'label': 'Papeleta votacion conyuge', 'valor': false},
        {'label': 'Copia de planilla de luz del Negocio, Oficina o de la Asociación', 'valor': false},
        {'label': 'Copia de planilla de luz del Domicilio', 'valor': false},
        {'label': 'Copia de Factura de venta del último mes (factura de hace 1 mes)', 'valor': false},
        {'label': 'Copia de Factura de venta del penúltimo mes (factura de hace 2 meses)', 'valor': false},
        {'label': 'Certificado de la Asociación (es opcional y aplica si usted es transportista: Bus o Taxi)', 'valor': false},
        {'label': 'Copia de matrícula del vehículo (opcional)', 'valor': false},
        {'label': 'Copia de pago de impuesto predial (opcional)', 'valor': false},
        {'label': 'Autorización y validación de información', 'valor': true},
    ];
    public checksEmpleado = [
        {'label': 'Identificacion', 'valor': false},
        {'label': 'Foto Carnet', 'valor': false},
        {'label': 'Papeleta votacion', 'valor': false},
        {'label': 'Identificacion conyuge', 'valor': false},
        {'label': 'Papeleta votacion conyuge', 'valor': false},
        {'label': 'Planilla luz domicilio', 'valor': false},
        {'label': 'Mecanizado Iess', 'valor': false},
        {'label': 'Matricula vehiculo', 'valor': false},
        {'label': 'Impuesto predial', 'valor': false},
        {'label': 'Buro credito', 'valor': false},
        {'label': 'Calificacion buro', 'valor': false},
        {'label': 'Observación', 'valor': false},
        {'label': 'Autorización y validación de información', 'valor': true},
    ];
    public checks;
    public soltero = false;
    public tiposNormales = {
        'Empleado': 'Credito Consumo Empleado',
        'Alfa': 'null'
    };
    public tiposPreaprobados = {
        'Empleado': 'Credito Consumo Empleado-PreAprobado',
        'Alfa': 'null'
    };

    constructor(
        private _router: Router,
        private paramService: ParametrizacionesService,
        private _creditosAutonomosService: CreditosAutonomosService,
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
        console.log('localStorage', localStorage.getItem('tipoPersona') === 'Empleado');
        if (localStorage.getItem('tipoPersona') === 'Empleado') {
            tipoPersona = 'EMPLEADO';
            this.checks = this.checksEmpleado;
        } else if (localStorage.getItem('tipoPersona') === 'Negocio propio') {
            tipoPersona = 'NEGOCIOS';
            this.checks = this.checksNegocio;
        } else {
            tipoPersona = 'ALFA';
            this.checks = [
                {'label': 'Cédula de identidad', 'valor': false},
                {'label': 'Papeleta de votación', 'valor': false},
                {'label': 'Selfie (Foto) con Cédula', 'valor': false},
                {'label': 'Planilla de luz del domicilio', 'valor': false},
                {'label': 'Matricula del vehículo (en caso de aplicar)', 'valor': false},
                {'label': 'Impuesto predial (en caso de aplicar)', 'valor': false},
                {'label': 'Documentación de tu madrina o padrino', 'valor': false},
                {'label': 'Autorización y validación de información', 'valor': false},
            ];
        }
        if (casados.find(item => item === localStorage.getItem('estadoCivil').toUpperCase())) {
            estadoCivil = 'CASADO';
        } else {
            estadoCivil = 'SOLTERO';
            this.soltero = true;
        }
        this.tipoPersona = `REQUISITOS_${tipoPersona}_${estadoCivil}_CREDICOMPRA`;
        this.formulario = new FormGroup({
            monto: new FormControl(this.montoCreditoFinal, [
                Validators.required, Validators.pattern('^([0-9])+$'), Validators.max(this.montoCreditoFinal)
            ]),
        });
    }
    get Form() {
        return this.formulario.controls;
    }

    ngOnInit(): void {
        this.getInfo();
        if (localStorage.getItem('credito') !== null) {
            this.solicitarCredito = JSON.parse(localStorage.getItem('credito'));
            this.solicitarCredito.canal = this.tiposPreaprobados[localStorage.getItem('tipoPersona')] || 'Credito Consumo Negocio-PreAprobado';
            this.solicitarCredito.tipoCredito = this.tiposPreaprobados[localStorage.getItem('tipoPersona')] || 'Credito Consumo Negocio-PreAprobado';
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
            canal: this.tiposNormales[localStorage.getItem('tipoPersona')] || 'Credito Consumo Negocio propio',
            tipoCredito: this.tiposNormales[localStorage.getItem('tipoPersona')] || 'Credito Consumo Negocio propio',
            concepto: this.tiposNormales[localStorage.getItem('tipoPersona')] || 'Credito Consumo Negocio propio',
            cargarOrigen: 'BIGPUNTOS',
            nombres: '',
            apellidos: '',
            numeroIdentificacion: '',
            user: '',
        };
    }

    getInfo() {
        this.paramService.obtenerListaPadresSinToken(this.tipoPersona).subscribe((info) => {
            this.requisitos = info[0];
        });
        this.paramService.obtenerListaPadresSinToken('TITULO_REQUISITOS_CREDICOMPRA_ULTIMA_PANTALLA').subscribe((info) => {
            this.descripcion = info[0];
            this.descripcion.valor = this.descripcion.valor.replace('${{montoCreditoFinal}}', this.montoCreditoFinal);
            this.descripcion.valor = this.descripcion.valor.replace('${{coutaMensual}}', this.coutaMensual);
        });
        this.paramService.obtenerListaPadresSinToken('VALOR_MINIMO_SOLICITAR_CREDITO_CONSUMO').subscribe((info) => {
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
        this.solicitarCredito.alcance = 'LOCAL';
        this.solicitarCredito.nombres = this.usuario.persona.nombres;
        this.solicitarCredito.apellidos = this.usuario.persona.apellidos;
        this.solicitarCredito.numeroIdentificacion = this.usuario.persona.identificacion;
        this.solicitarCredito.estadoCivil = this.usuario.persona.estadoCivil;
        this.solicitarCredito.empresaInfo = {};
        this.solicitarCredito.cuota = this.solicitarCredito.cuota ? this.solicitarCredito.cuota : this.coutaMensual;
        console.log('this.usuario.persona', this.usuario.persona);
        this.solicitarCredito.user = this.usuario.persona ? this.usuario.persona : JSON.parse(localStorage.getItem('grpPersonasUser')).persona;
        if (this.soltero) {
            this.checks.splice(3, 2);
        }
        this.solicitarCredito.checks = this.checks;
        // this.solicitarCredito.empresaComercial_id = localStorage.getItem('pagina');
        if (localStorage.getItem('credito')) {
            this._creditosAutonomosService.updateCredito(this.solicitarCredito).subscribe((info) => {
                this.continue(info._id);
            });
        } else {
            this._creditosAutonomosService.crearCredito(this.solicitarCredito).subscribe((info) => {
                this.continue(info._id);
            });
        }
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
        this._creditosAutonomosService.updateCreditoFormData(formData).subscribe(() => {
            localStorage.clear();
            this._router.navigate([
                `/personas/creditos-autonomos/validacion-datos`,
            ]);
        });
    }
}
