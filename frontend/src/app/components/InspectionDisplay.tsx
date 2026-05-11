import { AlertTriangle } from "lucide-react";
import { LoadingState } from "./LoadingState";
import { SettingsSheet } from "./SettingsSheet";
import { useRFIDInspection } from "../hooks/useRFIDInspection";

export function InspectionDisplay(): JSX.Element {
  const {
    view,
    loading,
    saveConfig,
    retryTransmission,
    simulateManualTags,
    simulateScenario,
  } = useRFIDInspection();

  const quantityDisplay = view.state === "READY" ? "- -" : String(view.result.totalCount);
  const typeDisplay = view.state === "READY" ? "- -" : view.result.representativeType;
  const showReadyCard = view.state === "READY";
  const isPassState = view.state === "API_SENT" || view.state === "EXIT_WAIT";
  const isFailState = view.state === "API_FAILED";
  const screenTone = showReadyCard ? "screen--ready" : isPassState ? "screen--pass" : isFailState ? "screen--fail" : "screen--detecting";

  return (
    <main className={`screen ${screenTone}`}>
      <div className="screen__container">
        {showReadyCard ? (
          <section className="inspection-panel inspection-panel--ready">
            <p className="ready-description">RFID 태그 인식 대기</p>
          </section>
        ) : (
          <section className="inspection-panel">
            <div className="card-block card-block--count">
              <p className="eyebrow">인식 수량</p>
              <div className="count-row">
                <div className="count-figure">
                  <span
                    className={`count-value ${
                      isPassState ? "count-value--pass" : isFailState ? "count-value--fail" : ""
                    }`}
                  >
                    {quantityDisplay}
                  </span>
                  <span className="count-unit">개</span>
                </div>
              </div>
            </div>

            <div className="card-divider" />

            <div className="card-block card-block--type">
              <p className="eyebrow eyebrow--small">파렛트 유형</p>
              <p className="type-value">{typeDisplay}</p>
            </div>

            <div className="card-divider" />

            <div className="card-block card-block--footer">
              {isPassState ? (
                <div className="pass-summary">
                  <div className="pass-mark">O</div>
                  <p className="pass-detail">{view.detailMessage}</p>
                </div>
              ) : isFailState ? (
                <div className="fail-summary">
                  <div className="fail-mark">X</div>
                  <p className="fail-detail">{view.detailMessage}</p>
                </div>
              ) : !view.isConfirmed ? (
                <LoadingState message={view.bottomMessage} detail={view.detailMessage} />
              ) : null}
            </div>

            {view.errorMessage ? (
              <div className="error-strip">
                <AlertTriangle aria-hidden="true" />
                <span>{view.errorMessage}</span>
              </div>
            ) : null}
          </section>
        )}
      </div>

      <div className="fab-stack">
        {view.canRetry ? (
          <button className="fab fab--danger" type="button" onClick={() => void retryTransmission()}>
            <AlertTriangle aria-hidden="true" />
            <span>재시도</span>
          </button>
        ) : null}
        <SettingsSheet
          config={view.config}
          onSaveConfig={saveConfig}
          onScenario={simulateScenario}
          onManualTags={simulateManualTags}
        />
      </div>

      {loading ? <div className="loading-overlay">검수 화면을 불러오는 중입니다...</div> : null}
    </main>
  );
}
