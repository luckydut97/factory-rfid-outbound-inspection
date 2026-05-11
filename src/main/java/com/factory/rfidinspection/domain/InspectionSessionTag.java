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
@Table(name = "inspection_session_tag")
public class InspectionSessionTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id")
    private Long sessionId;

    private String tag;

    @Enumerated(EnumType.STRING)
    @Column(name = "pallet_type")
    private PalletType palletType;

    @Column(name = "reader_name")
    private String readerName;

    @Column(name = "ant_name")
    private String antName;

    @Column(name = "ant_seq")
    private Integer antSeq;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "first_seen_at")
    private LocalDateTime firstSeenAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "read_count")
    private Integer readCount;

    @Column(name = "is_representative")
    private String isRepresentative;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
