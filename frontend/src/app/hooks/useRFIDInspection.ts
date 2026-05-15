import { useEffect, useRef, useState } from "react";
import type {
  InspectionConfig,
  InspectionCurrentResponse,
  InspectionResult,
  InspectionStatus,
  InspectionViewModel,
  PalletType,
  TagSummary,
} from "../types/inspection";

const POLL_MS = 1000;

const defaultConfig: InspectionConfig = {
  readerName: "NPC-청원공장",
  baseCount: 16,
  readWindowSec: 5,
  stableSec: 5,
  exitWaitSec: 10,
  resetSec: 3,
  apiUrl: null,
  apiTimeoutSec: 5,
};

const emptyResult: InspectionResult = {
  representativeType: "UNKNOWN",
  representativeCount: 0,
  totalCount: 0,
  deltaFromBase: 0,
  countsByType: {},
};

export function useRFIDInspection(): {
  view: InspectionViewModel;
  loading: boolean;
  refresh: () => Promise<void>;
  saveConfig: (config: InspectionConfig) => Promise<void>;
  resetAll: () => Promise<void>;
  retryTransmission: () => Promise<void>;
  simulateManualTags: (tags: string[], antName: string) => Promise<void>;
  simulateScenario: (scenario: string) => Promise<void>;
} {
  const [config, setConfig] = useState<InspectionConfig>(defaultConfig);
  const [rawStatus, setRawStatus] = useState<InspectionCurrentResponse | null>(null);
  const [viewState, setViewState] = useState<InspectionStatus>("READY");
  const [stateStartedAt, setStateStartedAt] = useState<number>(Date.now());
  const [stateElapsedSec, setStateElapsedSec] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stateTimerRef = useRef<number | null>(null);
  const stableStartRef = useRef<number | null>(null);
  const exitStartRef = useRef<number | null>(null);
  const resetStartRef = useRef<number | null>(null);
  const fingerprintRef = useRef<string>("");
  const evaluatedRef = useRef<boolean>(false);
  const lastActiveResultRef = useRef<InspectionResult>(emptyResult);
  const lastActiveAtRef = useRef<number | null>(null);
  const finalResultRef = useRef<InspectionResult>(emptyResult);
  const aggregatedTagsRef = useRef<Map<string, TagSummary>>(new Map());

  const refresh = async (): Promise<void> => {
    try {
      const [configRes, currentRes] = await Promise.all([
        fetch("/api/inspection/config"),
        fetch("/api/inspection/current"),
      ]);

      if (!configRes.ok || !currentRes.ok) {
        throw new Error("검수 상태를 조회하지 못했습니다.");
      }

      const fetchedConfig = (await configRes.json()) as InspectionConfig;
      const normalizedWaitSec = fetchedConfig.readWindowSec;
      const nextConfig: InspectionConfig = {
        ...fetchedConfig,
        readWindowSec: normalizedWaitSec,
        stableSec: normalizedWaitSec,
      };
      const nextCurrent = (await currentRes.json()) as InspectionCurrentResponse;
      setConfig(nextConfig);
      setRawStatus(nextCurrent);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!rawStatus) {
      return;
    }

    const now = Date.now();
    const liveTags = mergeActiveTags(rawStatus.tags, aggregatedTagsRef.current);
    const liveAnalyzed = analyzeTags(liveTags, config);
    if (liveAnalyzed.totalCount > 0) {
      lastActiveResultRef.current = liveAnalyzed;
      lastActiveAtRef.current = now;
    }

    const analyzed =
      liveAnalyzed.totalCount > 0
        ? liveAnalyzed
        : shouldKeepLastActive(now, lastActiveAtRef.current, config.readWindowSec)
          ? lastActiveResultRef.current
          : emptyResult;

    const nextFingerprint = JSON.stringify({
      totalCount: analyzed.totalCount,
      countsByType: analyzed.countsByType,
      representativeType: analyzed.representativeType,
    });
    let nextState: InspectionStatus = "READY";

    if (viewState === "API_SENT" || viewState === "EXIT_WAIT") {
      if (!exitStartRef.current) {
        exitStartRef.current = now;
      }
      const exitElapsed = secondsSince(exitStartRef.current, now);
      nextState = exitElapsed >= config.exitWaitSec ? "READY" : "API_SENT";
    } else if (viewState === "API_FAILED") {
      if (!exitStartRef.current) {
        exitStartRef.current = now;
      }
      const failElapsed = secondsSince(exitStartRef.current, now);
      nextState = failElapsed >= config.exitWaitSec ? "READY" : "API_FAILED";
    } else if (viewState === "API_SENDING" || viewState === "CONFIRMED") {
      nextState = viewState;
    } else if (analyzed.totalCount === 0) {
      clearPendingTimer();
      if (viewState === "RESET_WAIT") {
        if (!resetStartRef.current) {
          resetStartRef.current = now;
        }
        const resetElapsed = secondsSince(resetStartRef.current, now);
        nextState = resetElapsed >= config.resetSec ? "READY" : "RESET_WAIT";
      } else {
        resetStartRef.current = null;
        nextState = "READY";
      }
      stableStartRef.current = null;
      exitStartRef.current = null;
      fingerprintRef.current = "";
      evaluatedRef.current = false;
      lastActiveAtRef.current = null;
      lastActiveResultRef.current = emptyResult;
      finalResultRef.current = emptyResult;
      aggregatedTagsRef.current.clear();
    } else if (Object.values(analyzed.countsByType).filter((count) => count === analyzed.representativeCount).length > 1) {
      clearPendingTimer();
      nextState = "TYPE_AMBIGUOUS";
      stableStartRef.current = null;
      exitStartRef.current = null;
      resetStartRef.current = null;
      evaluatedRef.current = false;
      aggregatedTagsRef.current.clear();
    } else {
      if (fingerprintRef.current !== nextFingerprint) {
        stableStartRef.current = now;
        fingerprintRef.current = nextFingerprint;
        evaluatedRef.current = false;
        setStateStartedAt(now);
      }

      if (!stableStartRef.current) {
        stableStartRef.current = now;
      }

      const stableElapsed = secondsSince(stableStartRef.current, now);
      nextState = "STABLE_CHECK";

      if (analyzed.totalCount > config.baseCount && !evaluatedRef.current) {
        finalResultRef.current = analyzed;
        nextState = "API_FAILED";
        evaluatedRef.current = true;
        exitStartRef.current = now;
      } else if (stableElapsed >= config.readWindowSec && !evaluatedRef.current) {
        finalResultRef.current = analyzed;
        nextState = isInspectionPassed(analyzed, config.baseCount) ? "API_SENT" : "API_FAILED";
        evaluatedRef.current = true;
        exitStartRef.current = now;
      }
    }

    if (nextState === "API_FAILED" && viewState !== "API_FAILED") {
      exitStartRef.current = now;
    }

    if (nextState !== viewState) {
      if (nextState === "READY") {
        clearInspectionCycleState();
      }
      setViewState(nextState);
      setStateStartedAt(now);
    }
  }, [config, rawStatus, viewState]);

  useEffect(() => {
    if (viewState === "READY" || viewState === "DETECTING" || viewState === "STABLE_CHECK" || viewState === "TYPE_AMBIGUOUS" || viewState === "API_SENT" || viewState === "API_FAILED") {
      clearPendingTimer();
    }
  }, [viewState]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStateElapsedSec(secondsSince(stateStartedAt, Date.now()));
    }, 250);
    return () => window.clearInterval(id);
  }, [stateStartedAt]);

  useEffect(() => {
    return () => clearPendingTimer();
  }, []);

  const saveConfig = async (nextConfig: InspectionConfig): Promise<void> => {
    const response = await fetch("/api/inspection/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextConfig),
    });

    if (!response.ok) {
      throw new Error("설정을 저장하지 못했습니다.");
    }

    setConfig((await response.json()) as InspectionConfig);
    await refresh();
  };

  const resetAll = async (): Promise<void> => {
    const response = await fetch("/api/inspection/reset", { method: "POST" });
    if (!response.ok) {
      throw new Error("초기화를 실행하지 못했습니다.");
    }
    clearPendingTimer();
    clearInspectionCycleState();
    setViewState("READY");
    setStateStartedAt(Date.now());
    await refresh();
  };

  const retryTransmission = async (): Promise<void> => {
    const response = await fetch("/api/inspection/retry", { method: "POST" });
    if (!response.ok) {
      throw new Error("재시도를 실행하지 못했습니다.");
    }
    setViewState("API_SENDING");
    setStateStartedAt(Date.now());
    await refresh();
  };

  const simulateManualTags = async (tags: string[], antName: string): Promise<void> => {
    const response = await fetch("/api/inspection/simulate/manual-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        readerName: config.readerName,
        antName,
        tags,
      }),
    });
    if (!response.ok) {
      throw new Error("수동 태그를 추가하지 못했습니다.");
    }
    await refresh();
  };

  const simulateScenario = async (scenario: string): Promise<void> => {
    const response = await fetch("/api/inspection/simulate/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        readerName: config.readerName,
        scenario,
      }),
    });
    if (!response.ok) {
      throw new Error("시나리오를 실행하지 못했습니다.");
    }
    await refresh();
  };

  const currentAnalyzed = analyzeTags(Array.from(aggregatedTagsRef.current.values()), config);
  const displayResult =
    viewState === "API_SENT" || viewState === "EXIT_WAIT" || viewState === "API_FAILED" || viewState === "API_SENDING" || viewState === "CONFIRMED"
      ? finalResultRef.current
      : currentAnalyzed.totalCount > 0
        ? currentAnalyzed
        : shouldKeepLastActive(Date.now(), lastActiveAtRef.current, config.readWindowSec)
          ? lastActiveResultRef.current
          : emptyResult;
  const view = buildViewModel(viewState, displayResult, Array.from(aggregatedTagsRef.current.values()), config, stateElapsedSec, errorMessage);

  return {
    view,
    loading,
    refresh,
    saveConfig,
    resetAll,
    retryTransmission,
    simulateManualTags,
    simulateScenario,
  };

  function scheduleStateChange(nextState: InspectionStatus, delayMs: number) {
    clearPendingTimer();
    stateTimerRef.current = window.setTimeout(() => {
      setViewState(nextState);
      setStateStartedAt(Date.now());
      if (nextState === "API_SENT") {
        exitStartRef.current = Date.now();
      }
    }, delayMs);
  }

  function clearPendingTimer() {
    if (stateTimerRef.current) {
      window.clearTimeout(stateTimerRef.current);
      stateTimerRef.current = null;
    }
  }

  function clearInspectionCycleState() {
    fingerprintRef.current = "";
    stableStartRef.current = null;
    resetStartRef.current = null;
    exitStartRef.current = null;
    evaluatedRef.current = false;
    lastActiveAtRef.current = null;
    lastActiveResultRef.current = emptyResult;
    finalResultRef.current = emptyResult;
    aggregatedTagsRef.current.clear();
  }
}

export function analyzeCurrentTags(rawStatus: InspectionCurrentResponse | null, config: InspectionConfig): InspectionResult {
  return analyzeTags(rawStatus?.tags ?? [], config);
}

function buildViewModel(
  state: InspectionStatus,
  result: InspectionResult,
  tags: InspectionCurrentResponse["tags"],
  config: InspectionConfig,
  stateElapsedSec: number,
  errorMessage: string | null,
): InspectionViewModel {
  const isConfirmed = ["CONFIRMED", "API_SENDING", "API_SENT", "API_FAILED", "EXIT_WAIT", "RESET_WAIT"].includes(state);

  let topMessage: string | null = null;
  if (state === "READY") {
    topMessage = "검수 대기 중입니다. 파렛트를 안테나 앞으로 이동해주세요.";
  } else if (state === "API_SENT") {
    topMessage = "검수 통과. 화물차에 파렛트를 적재해주세요.";
  } else if (state === "API_FAILED") {
    topMessage = "X 유형 혼재";
  } else if (state === "EXIT_WAIT") {
    topMessage = "검수 통과. 화물차에 파렛트를 적재해주세요.";
  } else if (state === "RESET_WAIT") {
    topMessage = "초기화 중입니다. 다음 검수를 준비하고 있습니다.";
  } else if (state === "TYPE_AMBIGUOUS") {
    topMessage = "대표 유형이 동률입니다. 태그 상태를 다시 확인해주세요.";
  }

  let bottomMessage = "";
  let detailMessage: string | null = null;
  switch (state) {
    case "DETECTING":
      bottomMessage = "RFID 인식 중";
      detailMessage = `인식 유지 시간: ${stateElapsedSec}초`;
      break;
    case "STABLE_CHECK":
      bottomMessage = "인식 수량 확정 중";
      detailMessage = `${Math.max(config.readWindowSec - stateElapsedSec, 0)}초 후 판정`;
      break;
    case "READY":
      bottomMessage = "검수 대기 중";
      break;
    case "API_FAILED":
      bottomMessage = "X 유형 혼재";
      detailMessage = `별도 선별 공간에 보관해주세요. ${Math.max(config.exitWaitSec - stateElapsedSec, 0)}초`;
      break;
    case "API_SENT":
    case "EXIT_WAIT":
      bottomMessage = "검수 통과";
      detailMessage = `화물차에 파렛트를 적재해주세요. ${Math.max(config.exitWaitSec - stateElapsedSec, 0)}초`;
      break;
    default:
      bottomMessage = `기준 ${config.baseCount}개 대비 ${formatDelta(result.deltaFromBase)}`;
      break;
  }

  return {
    state,
    result,
    tags,
    config,
    stateElapsedSec,
    isConfirmed,
    topMessage,
    bottomMessage,
    detailMessage,
    failureSummary: state === "API_FAILED" ? buildFailureSummary(result) : null,
    errorMessage,
    canRetry: state === "API_FAILED",
  };
}

function secondsSince(start: number | null, now: number): number {
  if (!start) {
    return 0;
  }
  return Math.max(0, Math.floor((now - start) / 1000));
}

function formatDelta(delta: number): string {
  return delta >= 0 ? `+${delta}개` : `${delta}개`;
}

function isInspectionPassed(result: InspectionResult, baseCount: number): boolean {
  if (result.representativeCount !== baseCount) {
    return false;
  }

  const activeTypes = Object.values(result.countsByType).filter((count) => (count ?? 0) > 0);
  return activeTypes.length === 1;
}

function shouldKeepLastActive(now: number, lastActiveAt: number | null, readWindowSec: number): boolean {
  if (!lastActiveAt) {
    return false;
  }
  return now - lastActiveAt <= readWindowSec * 1000;
}

function buildFailureSummary(result: InspectionResult): string | null {
  const entries = Object.entries(result.countsByType)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

  if (entries.length <= 1) {
    return null;
  }

  const [mainType, mainCount] = entries[0];
  const mixed = entries
    .slice(1)
    .map(([type, count]) => `${type} ${count}개`)
    .join(", ");

  return `주유형 ${mainType} ${mainCount}개 / 혼재 ${mixed}`;
}

function analyzeTags(tags: TagSummary[], config: InspectionConfig): InspectionResult {
  if (tags.length === 0) {
    return emptyResult;
  }

  const countsByType = tags.reduce<Partial<Record<PalletType, number>>>((acc, tag) => {
    acc[tag.palletType] = (acc[tag.palletType] ?? 0) + 1;
    return acc;
  }, {});

  const representativeEntry =
    Object.entries(countsByType).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0] ?? null;

  const representativeType = (representativeEntry?.[0] as PalletType | undefined) ?? "UNKNOWN";
  const representativeCount = representativeEntry?.[1] ?? 0;
  const totalCount = tags.length;

  return {
    representativeType,
    representativeCount,
    totalCount,
    deltaFromBase: totalCount - config.baseCount,
    countsByType,
  };
}

function mergeActiveTags(incomingTags: TagSummary[], currentMap: Map<string, TagSummary>): TagSummary[] {
  for (const tag of incomingTags) {
    currentMap.set(tag.tag, tag);
  }
  return Array.from(currentMap.values());
}
