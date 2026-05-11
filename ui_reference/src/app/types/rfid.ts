export type PalletType = 'SP11' | 'SP12' | 'SP11C' | 'SP11T';

export type InspectionState =
  | 'READY'
  | 'DETECTING'
  | 'STABLE_CHECK'
  | 'CONFIRMED'
  | 'API_SENDING'
  | 'API_SENT'
  | 'API_FAILED'
  | 'EXIT_WAIT'
  | 'RESET_WAIT'
  | 'TYPE_AMBIGUOUS';

export interface RFIDTag {
  id: string;
  type: PalletType;
  timestamp: number;
}

export interface AdminSettings {
  base_count: number;
  read_window_sec: number;
  stable_sec: number;
  exit_wait_sec: number;
  reset_sec: number;
}

export interface TypeCount {
  type: PalletType;
  count: number;
  tags: RFIDTag[];
}

export interface InspectionResult {
  dominantType: PalletType | null;
  dominantCount: number;
  allTypes: TypeCount[];
  isAmbiguous: boolean;
}
