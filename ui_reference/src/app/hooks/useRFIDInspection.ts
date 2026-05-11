import { useState, useEffect, useCallback, useRef } from 'react';
import type { RFIDTag, InspectionState, AdminSettings, InspectionResult, PalletType, TypeCount } from '../types/rfid';

const DEFAULT_SETTINGS: AdminSettings = {
  base_count: 16,
  read_window_sec: 3,
  stable_sec: 3,
  exit_wait_sec: 10,
  reset_sec: 3,
};

export function useRFIDInspection(settings: AdminSettings = DEFAULT_SETTINGS) {
  const [state, setState] = useState<InspectionState>('READY');
  const [tags, setTags] = useState<RFIDTag[]>([]);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const stateTimerRef = useRef<number | null>(null);
  const lastStableResultRef = useRef<InspectionResult | null>(null);
  const confirmedTagsRef = useRef<RFIDTag[]>([]);

  const analyzeCurrentTags = useCallback((): InspectionResult => {
    const now = Date.now();
    const windowMs = settings.read_window_sec * 1000;
    const recentTags = tags.filter(tag => now - tag.timestamp < windowMs);

    const typeMap = new Map<PalletType, RFIDTag[]>();
    recentTags.forEach(tag => {
      const existing = typeMap.get(tag.type) || [];
      typeMap.set(tag.type, [...existing, tag]);
    });

    const allTypes: TypeCount[] = Array.from(typeMap.entries()).map(([type, tagList]) => ({
      type,
      count: tagList.length,
      tags: tagList,
    }));

    allTypes.sort((a, b) => b.count - a.count);

    const maxCount = allTypes[0]?.count || 0;
    const typesWithMaxCount = allTypes.filter(t => t.count === maxCount);
    const isAmbiguous = typesWithMaxCount.length > 1 && maxCount > 0;

    return {
      dominantType: isAmbiguous ? null : (allTypes[0]?.type || null),
      dominantCount: maxCount,
      allTypes,
      isAmbiguous,
    };
  }, [tags, settings.read_window_sec]);

  const sendToAPI = async (tags: RFIDTag[], type: PalletType): Promise<boolean> => {
    try {
      const response = await fetch('/api/rfid-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: tags.map(t => t.id),
          type,
          count: tags.length,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('API 전송 실패:', error);
      setErrorMessage(error instanceof Error ? error.message : 'API 전송 실패');
      return false;
    }
  };

  useEffect(() => {
    if (stateTimerRef.current) {
      clearTimeout(stateTimerRef.current);
      stateTimerRef.current = null;
    }

    const currentResult = analyzeCurrentTags();
    setResult(currentResult);

    switch (state) {
      case 'READY':
        if (currentResult.dominantCount > 0) {
          setState('DETECTING');
        }
        break;

      case 'DETECTING':
        if (currentResult.dominantCount === 0) {
          setState('RESET_WAIT');
          stateTimerRef.current = window.setTimeout(() => {
            setState('READY');
          }, settings.reset_sec * 1000);
        } else if (currentResult.isAmbiguous) {
          setState('TYPE_AMBIGUOUS');
        } else {
          const isSameAsLast =
            lastStableResultRef.current?.dominantType === currentResult.dominantType &&
            lastStableResultRef.current?.dominantCount === currentResult.dominantCount;

          if (!isSameAsLast) {
            lastStableResultRef.current = currentResult;
          }

          setState('STABLE_CHECK');
          stateTimerRef.current = window.setTimeout(() => {
            const checkResult = analyzeCurrentTags();
            if (
              checkResult.dominantType === lastStableResultRef.current?.dominantType &&
              checkResult.dominantCount === lastStableResultRef.current?.dominantCount &&
              !checkResult.isAmbiguous
            ) {
              setState('CONFIRMED');
            } else {
              setState('DETECTING');
            }
          }, settings.stable_sec * 1000);
        }
        break;

      case 'STABLE_CHECK':
        break;

      case 'CONFIRMED':
        if (currentResult.dominantType) {
          const dominantTags = currentResult.allTypes.find(t => t.type === currentResult.dominantType)?.tags || [];
          confirmedTagsRef.current = dominantTags;
          setState('API_SENDING');

          sendToAPI(dominantTags, currentResult.dominantType).then(success => {
            if (success) {
              setState('API_SENT');
              stateTimerRef.current = window.setTimeout(() => {
                setState('EXIT_WAIT');
                stateTimerRef.current = window.setTimeout(() => {
                  if (analyzeCurrentTags().dominantCount === 0) {
                    setState('RESET_WAIT');
                    stateTimerRef.current = window.setTimeout(() => {
                      setState('READY');
                      confirmedTagsRef.current = [];
                      lastStableResultRef.current = null;
                    }, settings.reset_sec * 1000);
                  }
                }, settings.exit_wait_sec * 1000);
              }, 1000);
            } else {
              setState('API_FAILED');
            }
          });
        }
        break;

      case 'API_SENDING':
      case 'API_SENT':
      case 'EXIT_WAIT':
        break;

      case 'API_FAILED':
        break;

      case 'RESET_WAIT':
        if (currentResult.dominantCount > 0) {
          setState('DETECTING');
        }
        break;

      case 'TYPE_AMBIGUOUS':
        if (currentResult.dominantCount === 0) {
          setState('RESET_WAIT');
          stateTimerRef.current = window.setTimeout(() => {
            setState('READY');
          }, settings.reset_sec * 1000);
        } else if (!currentResult.isAmbiguous) {
          setState('DETECTING');
        }
        break;
    }

    return () => {
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current);
      }
    };
  }, [tags, state, settings, analyzeCurrentTags]);

  const addTag = useCallback((tag: RFIDTag) => {
    setTags(prev => {
      const exists = prev.some(t => t.id === tag.id && t.type === tag.type);
      if (exists) {
        return prev.map(t =>
          t.id === tag.id && t.type === tag.type
            ? { ...t, timestamp: tag.timestamp }
            : t
        );
      }
      return [...prev, tag];
    });
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
  }, []);

  const reset = useCallback(() => {
    setTags([]);
    setState('READY');
    setResult(null);
    setErrorMessage('');
    confirmedTagsRef.current = [];
    lastStableResultRef.current = null;
    if (stateTimerRef.current) {
      clearTimeout(stateTimerRef.current);
      stateTimerRef.current = null;
    }
  }, []);

  const retryAPI = useCallback(() => {
    if (state === 'API_FAILED' && result?.dominantType) {
      const dominantTags = result.allTypes.find(t => t.type === result.dominantType)?.tags || [];
      setState('API_SENDING');
      sendToAPI(dominantTags, result.dominantType).then(success => {
        if (success) {
          setState('API_SENT');
        } else {
          setState('API_FAILED');
        }
      });
    }
  }, [state, result]);

  return {
    state,
    result,
    tags,
    errorMessage,
    addTag,
    removeTag,
    reset,
    retryAPI,
    confirmedTags: confirmedTagsRef.current,
  };
}
