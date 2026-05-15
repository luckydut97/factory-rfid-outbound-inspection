import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X } from "lucide-react";
import { AdminSettings } from "./AdminSettings";
import type { InspectionConfig } from "../types/inspection";

interface SettingsSheetProps {
  config: InspectionConfig;
  onSaveConfig: (config: InspectionConfig) => Promise<void>;
}

export function SettingsSheet({
  config,
  onSaveConfig,
}: SettingsSheetProps): JSX.Element {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="fab fab--solid" type="button">
          <Settings aria-hidden="true" />
          <span>환경설정</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="sheet-header">
            <div>
              <Dialog.Title className="sheet-title">환경설정</Dialog.Title>
              <Dialog.Description className="sheet-description">
                현장에 맞게 시간을 설정하고 적용 버튼을 누르세요.
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
