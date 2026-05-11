import { useState } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import type { PalletType, RFIDTag } from '../types/rfid';

interface RFIDSimulatorProps {
  onTagAdd: (tag: RFIDTag) => void;
  onTagRemove: (tagId: string) => void;
  currentTags: RFIDTag[];
}

const PALLET_TYPES: PalletType[] = ['SP11', 'SP12', 'SP11C', 'SP11T'];

export function RFIDSimulator({ onTagAdd, onTagRemove, currentTags }: RFIDSimulatorProps) {
  const [selectedType, setSelectedType] = useState<PalletType>('SP11');

  const generateTagId = (): string => {
    return `TAG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addSingleTag = () => {
    const tag: RFIDTag = {
      id: generateTagId(),
      type: selectedType,
      timestamp: Date.now(),
    };
    onTagAdd(tag);
  };

  const addMultipleTags = (count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const tag: RFIDTag = {
          id: generateTagId(),
          type: selectedType,
          timestamp: Date.now(),
        };
        onTagAdd(tag);
      }, i * 100);
    }
  };

  const removeAllTags = () => {
    currentTags.forEach(tag => onTagRemove(tag.id));
  };

  const simulateNormalShipment = () => {
    removeAllTags();
    setTimeout(() => addMultipleTags(16), 100);
  };

  const simulatePartialShipment = () => {
    removeAllTags();
    setTimeout(() => {
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          const tag: RFIDTag = {
            id: generateTagId(),
            type: 'SP11',
            timestamp: Date.now(),
          };
          onTagAdd(tag);
        }, i * 100);
      }
      setTimeout(() => {
        const tag: RFIDTag = {
          id: generateTagId(),
          type: 'SP12',
          timestamp: Date.now(),
        };
        onTagAdd(tag);
      }, 15 * 100);
    }, 100);
  };

  const simulateMixedTypes = () => {
    removeAllTags();
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const tag: RFIDTag = {
            id: generateTagId(),
            type: 'SP11',
            timestamp: Date.now(),
          };
          onTagAdd(tag);
        }, i * 100);
      }
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const tag: RFIDTag = {
            id: generateTagId(),
            type: 'SP12',
            timestamp: Date.now(),
          };
          onTagAdd(tag);
        }, (i + 8) * 100);
      }
    }, 100);
  };

  const typeCount = currentTags.reduce((acc, tag) => {
    acc[tag.type] = (acc[tag.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="size-5" />
          <CardTitle>RFID 시뮬레이터</CardTitle>
        </div>
        <CardDescription>
          테스트를 위한 RFID 태그 인식 시뮬레이터입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 현재 인식된 태그 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">현재 인식된 태그</h3>
            <Badge variant="outline">{currentTags.length}개</Badge>
          </div>
          {Object.keys(typeCount).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCount).map(([type, count]) => (
                <Badge key={type} className="text-sm py-1 px-3">
                  {type}: {count}개
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">인식된 태그가 없습니다.</p>
          )}
        </div>

        {/* 수동 추가 */}
        <div className="space-y-3">
          <h3 className="font-semibold">수동 태그 추가</h3>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as PalletType)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PALLET_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addSingleTag} size="sm">
              <Plus className="size-4 mr-1" />
              1개 추가
            </Button>
            <Button onClick={() => addMultipleTags(5)} variant="outline" size="sm">
              5개 추가
            </Button>
            <Button onClick={() => addMultipleTags(10)} variant="outline" size="sm">
              10개 추가
            </Button>
          </div>
        </div>

        {/* 시나리오 테스트 */}
        <div className="space-y-3">
          <h3 className="font-semibold">시나리오 테스트</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={simulateNormalShipment} variant="outline" size="sm">
              정상 출하 (16개)
            </Button>
            <Button onClick={simulatePartialShipment} variant="outline" size="sm">
              혼합 인식 (15+1)
            </Button>
            <Button onClick={simulateMixedTypes} variant="outline" size="sm">
              유형 동률 (8+8)
            </Button>
            <Button onClick={() => addMultipleTags(4)} variant="outline" size="sm">
              잔량 출하 (4개)
            </Button>
          </div>
        </div>

        {/* 초기화 */}
        <div className="pt-4 border-t">
          <Button onClick={removeAllTags} variant="destructive" size="sm" className="w-full">
            <Trash2 className="size-4 mr-2" />
            모든 태그 제거
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
