import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message: string;
  detail: string | null;
}

export function LoadingState({ message, detail }: LoadingStateProps): JSX.Element {
  return (
    <div className="loading-state">
      <div className="loading-state__row">
        <Loader2 aria-hidden="true" className="loading-state__icon" />
        <span>{message}</span>
      </div>
      {detail ? <p className="loading-state__detail">{detail}</p> : null}
    </div>
  );
}
