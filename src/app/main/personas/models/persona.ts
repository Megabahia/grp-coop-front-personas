export class CompletarPerfil {
    identificacion: string;
    nombres: string;
    apellidos: string;
    genero: string;
    fechaNacimiento: string;
    edad: number;
    whatsapp: string;
    user_id: string;
}
export class InformacionBasica {
    genero: string;
    fechaNacimiento: string;
    edad: number;
    pais?: string;
    provincia?: string;
    ciudad?: string;
    emailAdicional: string;
    telefono: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    user_id: string;
}
export class InformacionCompleta {
    created_at: string;
    identificacion: string;
    nombres: string;
    apellidos: string;
    genero: string;
    fechaNacimiento: string;
    edad: number;
    direccion: string;
    ciudad: string;
    provincia: string;
    pais: string;
    email: string;
    emailAdicional: string;
    telefono: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
}
export class SolicitarCredito {
    _id: string;
    monto: number;
    plazo: number;
    aceptaTerminos: number;
    estado: string;
    user_id: string;
    empresaComercial_id: string;
    empresaIfis_id: string;
    canal: string;
    tipoCredito?: string;
    concepto?: string;
    nombres?: string;
    apellidos?: string;
    numeroIdentificacion?: string;
    empresaInfo?: string;
    email?: string;
    cuota?: number;
    estadoCivil?: string;
    checks?: any;
    razonSocial?: string;
    rucEmpresa?: string;
    cargarOrigen?: string;
}
export class RucPersona {
    actividadComercial: string;
    antiguedadRuc: number;
    ciudad: string;
    gastoMensual: number;
    identificacion: string;
    nombreComercial: string;
    pais: string;
    provincia: string;
    razonSocial: string;
    ruc: string;
    user_id: string;
    ventaMensual: number;
    _id: string;
}
export class HistorialLaboral {
    fechaInicio: string;
    imagen: string;
    nombreEmpresa: string;
    tiempoTrabajo: number;
    cargoActual: string;
    profesion: string;
    _id: string;
}
