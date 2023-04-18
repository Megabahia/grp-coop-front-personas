export class PagoMonto {
    id: string;
    codigoCobro: string;
    monto: string;
    user_id: string;
    empresa_id: string;
}

export class GanarSuperMoneda {

    user_id: string;
    tipo: string;
    credito: number;
    descripcion: string;
    empresa_id: string;
}

export class FacturaFisica {
    _id: string;
    numeroFactura: string;
    razonSocial: string
    pais: string;
    provincia: string;
    ciudad: string;
    fechaEmision: string;
    importeTotal: number;
    categoria: string;
    urlFoto: string;
    urlArchivo: string;
    user_id: string;
    atencion: string;
    calificacion: string;
    observaciones: string;
}
export class FacturaFisicaCalificaciones {
    _id: string;
    razonSocial: string;
    pais: string;
    provincia: string;
    ciudad: string;
    importeTotal: number;
    categoria: string;
    user_id: string;
    atencion: string;
    calificacion: string;
    observaciones: string;
    estado:string;
}