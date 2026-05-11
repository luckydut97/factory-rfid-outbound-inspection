package com.factory.rfidinspection.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
@Entity
@Table(name = "inspection_session")
public class InspectionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_no")
    private String sessionNo;

    @Column(name = "reader_name")
    private String readerName;

    @Enumerated(EnumType.STRING)
    private InspectionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "representative_type")
    private PalletType representativeType;

    @Column(name = "representative_count")
    private Integer representativeCount;

    @Column(name = "total_count")
    private Integer totalCount;

    @Column(name = "base_count")
    private Integer baseCount;

    @Column(name = "first_detected_at")
    private LocalDateTime firstDetectedAt;

    @Column(name = "last_detected_at")
    private LocalDateTime lastDetectedAt;

    @Column(name = "stable_started_at")
    private LocalDateTime stableStartedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "api_status")
    private ApiStatus apiStatus;

    @Column(name = "api_sent_at")
    private LocalDateTime apiSentAt;

    @Column(name = "api_response_code")
    private String apiResponseCode;

    @Column(name = "api_response_message")
    private String apiResponseMessage;

    @Column(name = "exit_started_at")
    private LocalDateTime exitStartedAt;

    @Column(name = "reset_started_at")
    private LocalDateTime resetStartedAt;

    @Column(name = "reset_at")
    private LocalDateTime resetAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
