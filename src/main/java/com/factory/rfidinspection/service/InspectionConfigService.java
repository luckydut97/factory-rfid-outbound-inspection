package com.factory.rfidinspection.service;

import com.factory.rfidinspection.config.InspectionProperties;
import com.factory.rfidinspection.domain.InspectionConfigEntity;
import com.factory.rfidinspection.repository.InspectionConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InspectionConfigService {

    private final InspectionConfigRepository inspectionConfigRepository;
    private final InspectionProperties inspectionProperties;
    private final JdbcTemplate jdbcTemplate;

    public InspectionConfigSnapshot getCurrentConfig() {
        return inspectionConfigRepository.findByReaderNameAndUseYn(inspectionProperties.readerName(), "Y")
                .map(this::toSnapshot)
                .orElseGet(() -> new InspectionConfigSnapshot(
                        inspectionProperties.readerName(),
                        16,
                        3,
                        3,
                        10,
                        3,
                        null,
                        5
                ));
    }

    private InspectionConfigSnapshot toSnapshot(InspectionConfigEntity entity) {
        return new InspectionConfigSnapshot(
                entity.getReaderName(),
                entity.getBaseCount(),
                entity.getReadWindowSec(),
                entity.getStableSec(),
                entity.getExitWaitSec(),
                entity.getResetSec(),
                entity.getApiUrl(),
                entity.getApiTimeoutSec()
        );
    }

    @Transactional
    public InspectionConfigSnapshot updateConfig(ConfigUpdateCommand command) {
        jdbcTemplate.update(
                """
                INSERT INTO inspection_config (
                    reader_name, base_count, read_window_sec, stable_sec, exit_wait_sec, reset_sec, api_url, api_timeout_sec, use_yn
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Y')
                ON DUPLICATE KEY UPDATE
                    base_count = VALUES(base_count),
                    read_window_sec = VALUES(read_window_sec),
                    stable_sec = VALUES(stable_sec),
                    exit_wait_sec = VALUES(exit_wait_sec),
                    reset_sec = VALUES(reset_sec),
                    api_url = VALUES(api_url),
                    api_timeout_sec = VALUES(api_timeout_sec),
                    use_yn = 'Y'
                """,
                command.readerName(),
                command.baseCount(),
                command.readWindowSec(),
                command.stableSec(),
                command.exitWaitSec(),
                command.resetSec(),
                command.apiUrl(),
                command.apiTimeoutSec()
        );

        return inspectionConfigRepository.findByReaderNameAndUseYn(command.readerName(), "Y")
                .map(this::toSnapshot)
                .orElseThrow();
    }

    public record InspectionConfigSnapshot(
            String readerName,
            Integer baseCount,
            Integer readWindowSec,
            Integer stableSec,
            Integer exitWaitSec,
            Integer resetSec,
            String apiUrl,
            Integer apiTimeoutSec
    ) {
    }

    public record ConfigUpdateCommand(
            String readerName,
            Integer baseCount,
            Integer readWindowSec,
            Integer stableSec,
            Integer exitWaitSec,
            Integer resetSec,
            String apiUrl,
            Integer apiTimeoutSec
    ) {
    }
}
