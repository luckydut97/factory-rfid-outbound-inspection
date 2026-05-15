import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import type { InspectionConfig } from "../types/inspection";

interface AdminSettingsProps {
  config: InspectionConfig;
  onSave: (config: InspectionConfig) => Promise<void>;
}

export function AdminSettings({ config, onSave }: AdminSettingsProps): JSX.Element {
  const [draft, setDraft] = useState(config);
  const [isDirty, setIsDirty] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!isDirty) {
      setDraft(config);
    }
  }, [config, isDirty]);

  const updateField = (field: keyof InspectionConfig, value: string) => {
    setIsDirty(true);
    setDraft((current) => ({
      ...current,
      ...(field === "readWindowSec"
        ? {
            readWindowSec: Number(value),
            stableSec: Number(value),
          }
        : {
            [field]: field === "apiUrl" || field === "readerName" ? value : Number(value),
          }),
    }));
  };

  const resetDefaults = () => {
    setIsDirty(true);
    setDraft({
      ...draft,
      baseCount: 16,
      readWindowSec: 5,
      stableSec: 5,
      exitWaitSec: 10,
      resetSec: 3,
      apiTimeoutSec: 5,
    });
  };

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h3>관리자 설정</h3>
        <button className="ghost-button" type="button" onClick={resetDefaults}>
          기본값 재설정
        </button>
      </div>

      <div className="form-grid">
        <TextConfigField
          label="리더기 이름"
          hint="관리자 외 수정 금지"
          value={draft.readerName}
          onChange={(value) => updateField("readerName", value)}
        />
        <ConfigField
          label="기준 수량"
          hint="기본 검수 기준 수량"
          value={String(draft.baseCount)}
          onChange={(value) => updateField("baseCount", value)}
        />
        <ConfigField
          label="인식 대기 시간"
          hint="태그 인식 후 판정까지 대기 시간"
          value={String(draft.readWindowSec)}
          onChange={(value) => updateField("readWindowSec", value)}
        />
        <ConfigField
          label="출차 대기 시간"
          hint="판정 후 출차 안내 시간"
          value={String(draft.exitWaitSec)}
          onChange={(value) => updateField("exitWaitSec", value)}
        />
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={async () => {
          try {
            await onSave(draft);
            setIsDirty(false);
            setFeedback({ type: "success", message: "설정이 적용되었습니다." });
          } catch {
            setFeedback({ type: "error", message: "설정 적용에 실패했습니다." });
          }
        }}
      >
        <SlidersHorizontal aria-hidden="true" />
        <span>설정 적용</span>
      </button>

      {feedback ? (
        <p className={`settings-feedback settings-feedback--${feedback.type}`}>
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}

interface ConfigFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}

function ConfigField({ label, hint, value, onChange }: ConfigFieldProps): JSX.Element {
  const numericValue = Number(value) || 1;

  return (
    <div className="config-field">
      <span className="config-field__label">{label}</span>
      <div className="step-input">
        <input
          className="text-input text-input--step"
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "");
            onChange(next === "" ? "1" : next);
          }}
          onWheel={(event) => {
            event.currentTarget.blur();
          }}
        />
        <div className="step-input__actions">
          <button
            className="step-input__button"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange(String(numericValue + 1))}
            aria-label={`${label} 증가`}
          >
            <ChevronUp aria-hidden="true" />
          </button>
          <button
            className="step-input__button"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange(String(Math.max(1, numericValue - 1)))}
            aria-label={`${label} 감소`}
          >
            <ChevronDown aria-hidden="true" />
          </button>
        </div>
      </div>
      <span className="config-field__hint">{hint}</span>
    </div>
  );
}

interface TextConfigFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}

function TextConfigField({ label, hint, value, onChange }: TextConfigFieldProps): JSX.Element {
  return (
    <div className="config-field">
      <span className="config-field__label">{label}</span>
      <input
        className="text-input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="config-field__hint">{hint}</span>
    </div>
  );
}
