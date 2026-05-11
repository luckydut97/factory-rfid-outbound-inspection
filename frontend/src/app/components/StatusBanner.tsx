import { AlertTriangle, CheckCircle2, PackageSearch, RotateCcw, Truck } from "lucide-react";
import type { InspectionStatus } from "../types/inspection";

interface StatusBannerProps {
  status: InspectionStatus;
  message: string;
}

export function StatusBanner({ status, message }: StatusBannerProps): JSX.Element {
  const Icon = resolveIcon(status);

  return (
    <section className={`status-banner status-${status.toLowerCase()}`}>
      <Icon aria-hidden="true" className="status-banner__icon" />
      <p>{message}</p>
    </section>
  );
}

function resolveIcon(status: InspectionStatus) {
  switch (status) {
    case "API_SENT":
      return CheckCircle2;
    case "API_FAILED":
      return AlertTriangle;
    case "EXIT_WAIT":
      return Truck;
    case "RESET_WAIT":
      return RotateCcw;
    default:
      return PackageSearch;
  }
}
