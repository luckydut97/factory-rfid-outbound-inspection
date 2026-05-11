package com.factory.rfidinspection.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
@Entity
@Table(name = "inspection_config")
public class InspectionConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reader_name")
    private String readerName;

    @Column(name = "base_count")
    private Integer baseCount;

    @Column(name = "read_window_sec")
    private Integer readWindowSec;

    @Column(name = "stable_sec")
    private Integer stableSec;

    @Column(name = "exit_wait_sec")
    private Integer exitWaitSec;

    @Column(name = "reset_sec")
    private Integer resetSec;

    @Column(name = "api_url")
    private String apiUrl;

    @Column(name = "api_timeout_sec")
    private Integer apiTimeoutSec;

    @Column(name = "use_yn")
    private String useYn;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
