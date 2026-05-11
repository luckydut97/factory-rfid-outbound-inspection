import { useState } from "react";

interface SimulationPanelProps {
  onScenario: (scenario: string) => Promise<void>;
  onManualTags: (tags: string[], antName: string) => Promise<void>;
}

export function SimulationPanel({ onScenario, onManualTags }: SimulationPanelProps): JSX.Element {
  const [manualInput, setManualInput] = useState("NPC-AAAAAA\nNPC-AAAAAB");
  const [antName, setAntName] = useState("ANT-01");

  const submitManual = () => {
    const tags = manualInput
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    void onManualTags(tags, antName);
  };

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h3>RFID 시뮬레이터</h3>
      </div>

      <div className="scenario-grid">
        <button className="secondary-button" type="button" onClick={() => void onScenario("FULL_16")}>
          16개
        </button>
        <button className="secondary-button" type="button" onClick={() => void onScenario("FIFTEEN_PLUS_ONE")}>
          15+1
        </button>
        <button className="secondary-button" type="button" onClick={() => void onScenario("EIGHT_EIGHT")}>
          8+8
        </button>
        <button className="secondary-button" type="button" onClick={() => void onScenario("FOUR_ONLY")}>
          4개
        </button>
      </div>

      <label className="config-field">
        <span className="config-field__label">안테나 이름</span>
        <input className="text-input" type="text" value={antName} onChange={(event) => setAntName(event.target.value)} />
      </label>

      <label className="config-field">
        <span className="config-field__label">수동 태그 입력</span>
        <textarea
          className="text-area"
          rows={8}
          value={manualInput}
          onChange={(event) => setManualInput(event.target.value)}
        />
        <span className="config-field__hint">한 줄에 태그 1개씩 입력합니다.</span>
      </label>

      <button className="primary-button" type="button" onClick={submitManual}>
        수동 태그 추가
      </button>
    </section>
  );
}
