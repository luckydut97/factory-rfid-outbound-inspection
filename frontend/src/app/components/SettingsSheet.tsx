import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X } from "lucide-react";
import { AdminSettings } from "./AdminSettings";
import { SimulationPanel } from "./SimulationPanel";
import type { InspectionConfig } from "../types/inspection";

interface SettingsSheetProps {
  config: InspectionConfig;
  onSaveConfig: (config: InspectionConfig) => Promise<void>;
  onScenario: (scenario: string) => Promise<void>;
  onManualTags: (tags: string[], antName: string) => Promise<void>;
}

export function SettingsSheet({
  config,
  onSaveConfig,
  onScenario,
  onManualTags,
}: SettingsSheetProps): JSX.Element {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="fab fab--solid" type="button">
          <Settings aria-hidden="true" />
          <span>설정 및 테스트</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="sheet-header">
            <div>
              <Dialog.Title className="sheet-title">설정 및 테스트</Dialog.Title>
              <Dialog.Description className="sheet-description">
                현장 기준값과 RFID 시뮬레이션을 한 곳에서 관리합니다.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="닫기">
                <X />
              </button>
            </Dialog.Close>
          </div>

          <div className="sheet-body">
            <AdminSettings config={config} onSave={onSaveConfig} />
            <SimulationPanel onScenario={onScenario} onManualTags={onManualTags} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
