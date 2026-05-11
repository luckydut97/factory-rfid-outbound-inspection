import { Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { AdminSettings as AdminSettingsType } from '../types/rfid';

interface AdminSettingsProps {
  settings: AdminSettingsType;
  onSettingsChange: (settings: AdminSettingsType) => void;
}

export function AdminSettings({ settings, onSettingsChange }: AdminSettingsProps) {
  const handleChange = (key: keyof AdminSettingsType, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onSettingsChange({
      base_count: 16,
      read_window_sec: 3,
      stable_sec: 3,
      exit_wait_sec: 10,
      reset_sec: 3,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="size-5" />
          <CardTitle>관리자 설정</CardTitle>
        </div>
        <CardDescription>
          RFID 검수 시스템의 동작 파라미터를 설정합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="base_count">기준 수량 (base_count)</Label>
          <Input
            id="base_count"
            type="number"
            min="1"
            value={settings.base_count}
            onChange={(e) => handleChange('base_count', parseInt(e.target.value) || 16)}
          />
          <p className="text-sm text-muted-foreground">
            작업자가 참고할 기본 출하 단위 (기본값: 16개)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="read_window_sec">인식 유지 시간 (read_window_sec)</Label>
          <Input
            id="read_window_sec"
            type="number"
            min="1"
            step="0.5"
            value={settings.read_window_sec}
            onChange={(e) => handleChange('read_window_sec', parseFloat(e.target.value) || 3)}
          />
          <p className="text-sm text-muted-foreground">
            최근 몇 초 동안 읽힌 태그를 현재 인식으로 볼 것인지 기준 시간 (기본값: 3초)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stable_sec">개수 확정 시간 (stable_sec)</Label>
          <Input
            id="stable_sec"
            type="number"
            min="1"
            step="0.5"
            value={settings.stable_sec}
            onChange={(e) => handleChange('stable_sec', parseFloat(e.target.value) || 3)}
          />
          <p className="text-sm text-muted-foreground">
            대표 유형과 인식 개수가 변하지 않고 유지되어야 최종 인식 결과로 인정하는 시간 (기본값: 3초)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exit_wait_sec">출차 대기 시간 (exit_wait_sec)</Label>
          <Input
            id="exit_wait_sec"
            type="number"
            min="1"
            value={settings.exit_wait_sec}
            onChange={(e) => handleChange('exit_wait_sec', parseInt(e.target.value) || 10)}
          />
          <p className="text-sm text-muted-foreground">
            API 전송 후 지게차가 안테나 구역에서 벗어나도록 안내하는 시간 (기본값: 10초)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset_sec">초기화 시간 (reset_sec)</Label>
          <Input
            id="reset_sec"
            type="number"
            min="1"
            step="0.5"
            value={settings.reset_sec}
            onChange={(e) => handleChange('reset_sec', parseFloat(e.target.value) || 3)}
          />
          <p className="text-sm text-muted-foreground">
            태그가 0개인 상태가 일정 시간 유지되면 다음 검수를 위해 초기화하는 시간 (기본값: 3초)
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={resetToDefaults}>
            기본값으로 재설정
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
