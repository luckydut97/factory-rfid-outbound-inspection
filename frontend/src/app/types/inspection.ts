export type InspectionStatus =
  | "READY"
  | "DETECTING"
  | "STABLE_CHECK"
  | "CONFIRMED"
  | "API_SENDING"
  | "API_SENT"
  | "API_FAILED"
  | "EXIT_WAIT"
  | "RESET_WAIT"
  | "TYPE_AMBIGUOUS";

export type PalletType = "SP11" | "SP12" | "SP11C" | "SP11T" | "UNKNOWN";

export interface TagSummary {
  tag: string;
  palletType: PalletType;
  antName: string;
  antSeq: number;
  ipAddress: string;
  firstSeenAt: string;
  lastSeenAt: string;
  readCount: number;
}

export interface InspectionCurrentResponse {
  readerName: string;
  status: InspectionStatus;
  baseCount: number;
  totalCount: number;
  representativeType: PalletType;
  representativeCount: number;
  countsByType: Partial<Record<PalletType, number>>;
  tags: TagSummary[];
  latestSessionNo: string | null;
}

export interface InspectionConfig {
  readerName: string;
  baseCount: number;
  readWindowSec: number;
  stableSec: number;
  exitWaitSec: number;
  resetSec: number;
  apiUrl: string | null;
  apiTimeoutSec: number;
}

export interface InspectionResult {
  representativeType: PalletType;
  representativeCount: number;
  totalCount: number;
  deltaFromBase: number;
  countsByType: Partial<Record<PalletType, number>>;
}

export interface InspectionViewModel {
  state: InspectionStatus;
  result: InspectionResult;
  tags: TagSummary[];
  config: InspectionConfig;
  stateElapsedSec: number;
  isConfirmed: boolean;
  topMessage: string | null;
  bottomMessage: string;
  detailMessage: string | null;
  failureSummary: string | null;
  errorMessage: string | null;
  canRetry: boolean;
}
