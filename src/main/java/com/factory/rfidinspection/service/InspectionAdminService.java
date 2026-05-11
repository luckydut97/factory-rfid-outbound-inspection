package com.factory.rfidinspection.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InspectionAdminService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void insertManualTags(String readerName, String antName, List<String> tags) {
        LocalDateTime now = LocalDateTime.now();
        int antSeq = parseAntSeq(antName);

        jdbcTemplate.batchUpdate(
                """
                INSERT INTO tbl_tag_log (
                    create_time, reader_name, ant_name, tag, ip_address, ant_seq, state
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                tags,
                tags.size(),
                (ps, tag) -> {
                    ps.setTimestamp(1, Timestamp.valueOf(now));
                    ps.setString(2, readerName);
                    ps.setString(3, antName);
                    ps.setString(4, tag);
                    ps.setString(5, "127.0.0.1");
                    ps.setInt(6, antSeq);
                    ps.setInt(7, 1);
                }
        );
    }

    @Transactional
    public void insertScenario(String readerName, String scenario) {
        List<String> tags = switch (scenario) {
            case "FULL_16" -> generateTags("SP11", 16);
            case "FIFTEEN_PLUS_ONE" -> {
                List<String> values = generateTags("SP11", 15);
                values.add("SP12-SIM-0012");
                yield values;
            }
            case "EIGHT_EIGHT" -> {
                List<String> values = generateTags("SP11", 8);
                values.addAll(generateTags("SP12", 8));
                yield values;
            }
            case "FOUR_ONLY" -> generateTags("SP11", 4);
            default -> throw new IllegalArgumentException("Unsupported scenario: " + scenario);
        };

        insertManualTags(readerName, "ANT-01", tags);
    }

    @Transactional
    public void resetInspectionData() {
        jdbcTemplate.update("DELETE FROM inspection_api_log");
        jdbcTemplate.update("DELETE FROM inspection_session_tag");
        jdbcTemplate.update("DELETE FROM inspection_session");
        jdbcTemplate.update("DELETE FROM agent_tbl_tag_log");
        jdbcTemplate.update("DELETE FROM tbl_tag_log");
    }

    public void retryFailedTransmission() {
        // Placeholder until session/API integration is implemented.
    }

    private List<String> generateTags(String prefix, int count) {
        List<String> tags = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            tags.add("%s-SIM-%04d".formatted(prefix, i));
        }
        return tags;
    }

    private int parseAntSeq(String antName) {
        String digits = antName.replaceAll("\\D", "");
        return digits.isBlank() ? 1 : Integer.parseInt(digits);
    }
}
