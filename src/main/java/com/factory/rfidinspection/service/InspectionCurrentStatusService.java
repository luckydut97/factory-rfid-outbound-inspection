package com.factory.rfidinspection.service;

import com.factory.rfidinspection.domain.AgentTagLog;
import com.factory.rfidinspection.domain.InspectionSession;
import com.factory.rfidinspection.domain.InspectionStatus;
import com.factory.rfidinspection.domain.PalletType;
import com.factory.rfidinspection.repository.AgentTagLogRepository;
import com.factory.rfidinspection.repository.InspectionSessionRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InspectionCurrentStatusService {

    private final AgentTagLogRepository agentTagLogRepository;
    private final InspectionSessionRepository inspectionSessionRepository;
    private final InspectionConfigService inspectionConfigService;
    private final PalletTypeClassifier palletTypeClassifier;

    public InspectionCurrentStatus getCurrentStatus() {
        InspectionConfigService.InspectionConfigSnapshot config = inspectionConfigService.getCurrentConfig();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from = now.minusSeconds(config.readWindowSec());

        List<AgentTagLog> logs = agentTagLogRepository.findByReaderNameAndCreateTimeAfterOrderByCreateTimeAsc(
                config.readerName(),
                from
        );

        Map<String, TagSummary> tagSummaries = summarizeTags(logs);
        Map<PalletType, Long> countsByType = tagSummaries.values().stream()
                .collect(Collectors.groupingBy(TagSummary::palletType, () -> new EnumMap<>(PalletType.class), Collectors.counting()));

        Optional<Map.Entry<PalletType, Long>> representative = countsByType.entrySet().stream()
                .max(Map.Entry.comparingByValue());

        InspectionStatus status = resolveStatus(logs.isEmpty(), representative.map(Map.Entry::getKey).orElse(null), countsByType);
        Optional<InspectionSession> latestSession = inspectionSessionRepository.findTopByReaderNameOrderByCreatedAtDesc(config.readerName());

        return new InspectionCurrentStatus(
                config.readerName(),
                status,
                config.baseCount(),
                tagSummaries.size(),
                representative.map(Map.Entry::getKey).orElse(PalletType.UNKNOWN),
                representative.map(entry -> entry.getValue().intValue()).orElse(0),
                countsByType,
                new java.util.ArrayList<>(tagSummaries.values()),
                latestSession.map(InspectionSession::getSessionNo).orElse(null)
        );
    }

    private InspectionStatus resolveStatus(boolean empty, PalletType representativeType, Map<PalletType, Long> countsByType) {
        if (empty) {
            return InspectionStatus.READY;
        }
        long maxCount = countsByType.values().stream().mapToLong(Long::longValue).max().orElse(0L);
        long maxTypeCount = countsByType.values().stream().filter(count -> count == maxCount).count();
        if (maxTypeCount > 1) {
            return InspectionStatus.TYPE_AMBIGUOUS;
        }
        if (representativeType == null || representativeType == PalletType.UNKNOWN) {
            return InspectionStatus.DETECTING;
        }
        return InspectionStatus.STABLE_CHECK;
    }

    private Map<String, TagSummary> summarizeTags(List<AgentTagLog> logs) {
        Map<String, List<AgentTagLog>> grouped = logs.stream()
                .filter(log -> log.getTag() != null && !log.getTag().isBlank())
                .collect(Collectors.groupingBy(AgentTagLog::getTag, LinkedHashMap::new, Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<AgentTagLog> entries = entry.getValue();
                    entries.sort(Comparator.comparing(AgentTagLog::getCreateTime));
                    AgentTagLog first = entries.get(0);
                    AgentTagLog last = entries.get(entries.size() - 1);
                    PalletType palletType = first.getPalletType() != null
                            ? first.getPalletType()
                            : palletTypeClassifier.classify(first.getTag());

                    return new TagSummary(
                            first.getTag(),
                            palletType,
                            first.getAntName(),
                            first.getAntSeq(),
                            first.getIpAddress(),
                            first.getCreateTime(),
                            last.getCreateTime(),
                            entries.size()
                    );
                })
                .collect(Collectors.toMap(TagSummary::tag, summary -> summary, (left, right) -> left, LinkedHashMap::new));
    }

    public record InspectionCurrentStatus(
            String readerName,
            InspectionStatus status,
            Integer baseCount,
            Integer totalCount,
            PalletType representativeType,
            Integer representativeCount,
            Map<PalletType, Long> countsByType,
            List<TagSummary> tags,
            String latestSessionNo
    ) {
    }

    public record TagSummary(
            String tag,
            PalletType palletType,
            String antName,
            Integer antSeq,
            String ipAddress,
            LocalDateTime firstSeenAt,
            LocalDateTime lastSeenAt,
            Integer readCount
    ) {
    }
}
