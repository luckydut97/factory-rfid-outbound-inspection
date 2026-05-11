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
@Table(name = "agent_tbl_tag_log")
public class AgentTagLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "reader_name")
    private String readerName;

    @Column(name = "ant_name")
    private String antName;

    private String tag;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "ant_seq")
    private Integer antSeq;

    private Integer state;

    @Enumerated(EnumType.STRING)
    @Column(name = "pallet_type")
    private PalletType palletType;

    @Column(name = "processed_yn")
    private String processedYn;

    @Column(name = "inserted_at")
    private LocalDateTime insertedAt;
}
