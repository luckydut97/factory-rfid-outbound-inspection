import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import type { InspectionState, InspectionResult, AdminSettings } from '../types/rfid';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface InspectionDisplayProps {
  state: InspectionState;
  result: InspectionResult | null;
  settings: AdminSettings;
  errorMessage?: string;
}

const STATE_MESSAGES: Record<InspectionState, string> = {
  READY: '검수 대기 중입니다.',
  DETECTING: 'RFID 인식 중입니다.',
  STABLE_CHECK: '인식 수량을 확정 중입니다.',
  CONFIRMED: '인식 결과가 확정되었습니다.',
  API_SENDING: '전산으로 전송 중입니다.',
  API_SENT: '전산 전송 완료. 수량 확인 후 출하 진행 바랍니다.',
  API_FAILED: '전산 전송 실패. 관리자 확인이 필요합니다.',
  EXIT_WAIT: '출차 대기 중입니다. 안테나 구역에서 벗어나 주세요.',
  RESET_WAIT: '초기화 중입니다. 다음 검수를 준비하고 있습니다.',
  TYPE_AMBIGUOUS: '유형 혼합 인식. 파렛트를 확인해 주세요.',
};

const getStateIcon = (state: InspectionState) => {
  switch (state) {
    case 'READY':
    case 'RESET_WAIT':
      return <Clock className="size-16" />;
    case 'DETECTING':
    case 'STABLE_CHECK':
    case 'API_SENDING':
      return <Loader2 className="size-16 animate-spin" />;
    case 'CONFIRMED':
    case 'API_SENT':
      return <CheckCircle2 className="size-16" />;
    case 'API_FAILED':
    case 'TYPE_AMBIGUOUS':
      return <XCircle className="size-16" />;
    case 'EXIT_WAIT':
      return <AlertCircle className="size-16" />;
    default:
      return <Clock className="size-16" />;
  }
};

const getStateColor = (state: InspectionState): string => {
  switch (state) {
    case 'READY':
    case 'RESET_WAIT':
      return 'text-gray-500';
    case 'DETECTING':
    case 'STABLE_CHECK':
      return 'text-blue-500';
    case 'CONFIRMED':
      return 'text-green-600';
    case 'API_SENDING':
      return 'text-blue-600';
    case 'API_SENT':
      return 'text-green-600';
    case 'API_FAILED':
      return 'text-red-600';
    case 'EXIT_WAIT':
      return 'text-orange-500';
    case 'TYPE_AMBIGUOUS':
      return 'text-amber-600';
    default:
      return 'text-gray-500';
  }
};

export function InspectionDisplay({ state, result, settings, errorMessage }: InspectionDisplayProps) {
  const countDiff = result ? result.dominantCount - settings.base_count : 0;
  const showResult = result && result.dominantType && result.dominantCount > 0;
  const isConfirmed = ['CONFIRMED', 'API_SENDING', 'API_SENT', 'API_FAILED', 'EXIT_WAIT'].includes(state);
  const showTopStatus = ['READY', 'API_SENT', 'API_FAILED', 'EXIT_WAIT', 'RESET_WAIT', 'TYPE_AMBIGUOUS'].includes(state);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* 상태 표시 - 중요한 상태만 */}
        {showTopStatus && (
          <div className={`flex items-center justify-center gap-4 ${getStateColor(state)}`}>
            {getStateIcon(state)}
            <div className="text-3xl font-semibold">{STATE_MESSAGES[state]}</div>
          </div>
        )}

        {/* 대표 유형 및 수량 - 대형 표시 */}
        {showResult && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-8">
            {/* 인식 수량 - 최우선 표시 */}
            <div className="text-center">
              <div className="text-gray-600 text-3xl mb-4">인식 수량</div>
              <div className="flex items-baseline justify-center gap-8">
                <div className={`text-[20rem] font-bold leading-none ${isConfirmed ? 'text-red-600' : 'text-slate-800'}`}>
                  {result.dominantCount}
                </div>
                <div className="text-6xl text-gray-400 pb-8">개</div>
              </div>
            </div>

            {/* 파렛트 유형 */}
            <div className="text-center border-t-2 border-gray-200 pt-8">
              <div className="text-gray-600 text-2xl mb-3">파렛트 유형</div>
              <div className="text-7xl font-bold text-blue-600 tracking-tight">
                {result.dominantType}
              </div>
            </div>

            {/* 기준 대비 / 상태 메시지 */}
            <div className="flex flex-col items-center justify-center gap-4 text-3xl border-t-2 border-gray-200 pt-8">
              {isConfirmed ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">기준 {settings.base_count}개 대비</span>
                  {countDiff === 0 ? (
                    <Badge className="text-2xl py-2 px-6 bg-green-500">정상</Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-2xl py-2 px-6 ${countDiff > 0 ? 'border-orange-500 text-orange-600' : 'border-amber-500 text-amber-600'}`}
                    >
                      {countDiff > 0 ? '+' : ''}{countDiff}개
                    </Badge>
                  )}
                </div>
              ) : (
                <>
                  <div className={`flex items-center gap-3 ${getStateColor(state)} font-semibold`}>
                    {['DETECTING', 'STABLE_CHECK', 'API_SENDING'].includes(state) && (
                      <Loader2 className="size-8 animate-spin" />
                    )}
                    <span>{STATE_MESSAGES[state]}</span>
                  </div>
                  {state === 'STABLE_CHECK' && (
                    <div className="text-xl text-gray-500">
                      {settings.stable_sec}초 동안 유지 확인 중...
                    </div>
                  )}
                  {state === 'DETECTING' && (
                    <div className="text-xl text-gray-500">
                      인식 유지 시간: {settings.read_window_sec}초
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 유형 혼합 경고 */}
        {result?.isAmbiguous && (
          <Alert className="bg-amber-50 border-amber-300">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <AlertDescription className="text-xl text-amber-800">
              여러 유형이 동일하게 인식되었습니다. 파렛트 구성을 확인해 주세요.
              {result.allTypes.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.allTypes.map(tc => (
                    <div key={tc.type} className="flex justify-between">
                      <span className="font-semibold">{tc.type}</span>
                      <span>{tc.count}개</span>
                    </div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* API 오류 메시지 */}
        {state === 'API_FAILED' && errorMessage && (
          <Alert variant="destructive" className="text-xl">
            <XCircle className="h-6 w-6" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* 대기 상태일 때 안내 */}
        {state === 'READY' && (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <div className="text-6xl font-bold text-gray-300 mb-4">- -</div>
            <div className="text-2xl text-gray-500">RFID 태그를 인식 대기 중입니다</div>
          </div>
        )}
      </div>
    </div>
  );
}
