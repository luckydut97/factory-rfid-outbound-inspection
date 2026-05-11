import { useEffect, useState } from "react";
import type { InspectionConfig } from "../types/inspection";

interface AdminSettingsProps {
  config: InspectionConfig;
  onSave: (config: InspectionConfig) => Promise<void>;
}

export function AdminSettings({ config, onSave }: AdminSettingsProps): JSX.Element {
  const [draft, setDraft] = useState(config);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const updateField = (field: keyof InspectionConfig, value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: field === "apiUrl" ? value : Number(value),
    }));
  };

  const resetDefaults = () => {
    setDraft({
      ...draft,
      baseCount: 16,
      readWindowSec: 3,
      stableSec: 3,
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
        <ConfigField
          label="기준 수량"
          hint="기본 검수 기준 수량"
          value={String(draft.baseCount)}
          onChange={(value) => updateField("baseCount", value)}
        />
        <ConfigField
          label="인식 윈도우"
          hint="최근 몇 초 데이터를 묶을지"
          value={String(draft.readWindowSec)}
          onChange={(value) => updateField("readWindowSec", value)}
        />
        <ConfigField
          label="확정 유지 시간"
          hint="대표 수량을 몇 초 유지할지"
          value={String(draft.stableSec)}
          onChange={(value) => updateField("stableSec", value)}
        />
        <ConfigField
          label="출차 대기 시간"
          hint="전송 후 출차 안내 시간"
          value={String(draft.exitWaitSec)}
          onChange={(value) => updateField("exitWaitSec", value)}
        />
        <ConfigField
          label="초기화 시간"
          hint="0개 상태를 몇 초 유지할지"
          value={String(draft.resetSec)}
          onChange={(value) => updateField("resetSec", value)}
        />
        <ConfigField
          label="API 타임아웃"
          hint="전산 호출 제한 시간"
          value={String(draft.apiTimeoutSec)}
          onChange={(value) => updateField("apiTimeoutSec", value)}
        />
      </div>

      <label className="config-field">
        <span className="config-field__label">전산 API URL</span>
        <input
          className="text-input"
          type="text"
          value={draft.apiUrl ?? ""}
          onChange={(event) => updateField("apiUrl", event.target.value)}
        />
      </label>

      <button className="primary-button" type="button" onClick={() => void onSave(draft)}>
        설정 저장
      </button>
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
  return (
    <label className="config-field">
      <span className="config-field__label">{label}</span>
      <input className="text-input" type="number" min="1" value={value} onChange={(event) => onChange(event.target.value)} />
      <span className="config-field__hint">{hint}</span>
    </label>
  );
}
