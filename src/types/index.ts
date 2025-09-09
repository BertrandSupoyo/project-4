export interface SubstationData {
  id: string;
  no: number;
  ulp: string;
  noGardu: string;
  namaLokasiGardu: string;
  jenis: string;
  merek: string;
  daya: string;
  tahun: string;
  phasa: string;
  tap_trafo_max_tap: string;
  penyulang: string;
  arahSequence: string;
  tanggal: string;
  measurements: {
    month: string;
    r: number;
    s: number;      
    t: number;
    n: number;
    rn: number;
    sn: number;
    tn: number;
    pp: number;
    pn: number;
  }[];
  measurements_siang?: {
    id?: number;
    substationId?: string;
    month?: string;
    r?: number;
    s?: number;
    t?: number;
    n?: number;
    rn?: number;
    sn?: number;
    tn?: number;
    pp?: number;
    pn?: number;
    row_name?: string;
  }[];
  measurements_malam?: {
    id?: number;
    substationId?: string;
    month?: string;
    r?: number;
    s?: number;
    t?: number;
    n?: number;
    rn?: number;
    sn?: number;
    tn?: number;
    pp?: number;
    pn?: number;
    row_name?: string;
  }[];
  status: 'normal' | 'warning' | 'critical' | 'non-active';
  lastUpdate: string;
  is_active: number;
  ugb: number;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  photoUrlR?: string;
  photoUrlS?: string;
  photoUrlT?: string;
  photoUrlN?: string;
  photoUrlPP?: string;
  photoUrlPN?: string;
}

export interface DashboardStats {
  totalSubstations: number;
  activeSubstations: number;
  criticalIssues: number;
  monthlyMeasurements: number;
  ugbActive: number;
}