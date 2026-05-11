import { useState } from 'react';
import { Settings, Play, RotateCcw } from 'lucide-react';
import { useRFIDInspection } from './hooks/useRFIDInspection';
import { InspectionDisplay } from './components/InspectionDisplay';
import { AdminSettings } from './components/AdminSettings';
import { RFIDSimulator } from './components/RFIDSimulator';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import type { AdminSettings as AdminSettingsType } from './types/rfid';

export default function App() {
  const [settings, setSettings] = useState<AdminSettingsType>({
    base_count: 16,
    read_window_sec: 3,
    stable_sec: 3,
    exit_wait_sec: 10,
    reset_sec: 3,
  });

  const {
    state,
    result,
    tags,
    errorMessage,
    addTag,
    removeTag,
    reset,
    retryAPI,
  } = useRFIDInspection(settings);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative size-full">
      {/* 메인 검수 화면 */}
      <InspectionDisplay
        state={state}
        result={result}
        settings={settings}
        errorMessage={errorMessage}
      />

      {/* 설정 및 시뮬레이터 버튼 (우측 하단) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        {/* 재시도 버튼 (API 실패 시) */}
        {state === 'API_FAILED' && (
          <Button
            onClick={retryAPI}
            size="lg"
            variant="destructive"
            className="shadow-lg"
          >
            <RotateCcw className="size-5 mr-2" />
            재시도
          </Button>
        )}

        {/* 초기화 버튼 */}
        <Button
          onClick={reset}
          size="lg"
          variant="outline"
          className="shadow-lg"
        >
          <RotateCcw className="size-5 mr-2" />
          초기화
        </Button>

        {/* 설정 및 시뮬레이터 */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <Settings className="size-5 mr-2" />
              설정 및 테스트
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>관리자 설정 및 시뮬레이터</SheetTitle>
              <SheetDescription>
                시스템 설정 변경 및 RFID 태그 인식 테스트
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="simulator" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simulator">
                  <Play className="size-4 mr-2" />
                  시뮬레이터
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="size-4 mr-2" />
                  설정
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simulator" className="mt-6">
                <RFIDSimulator
                  onTagAdd={addTag}
                  onTagRemove={removeTag}
                  currentTags={tags}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <AdminSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}