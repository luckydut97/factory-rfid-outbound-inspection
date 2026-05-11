CREATE TABLE agent_tbl_tag_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    create_time DATETIME NULL,
    reader_name VARCHAR(100) NULL,
    ant_name VARCHAR(100) NULL,
    tag VARCHAR(255) NULL,
    ip_address VARCHAR(100) NULL,
    ant_seq INT NULL,
    state INT NULL,
    pallet_type VARCHAR(20) NULL,
    processed_yn CHAR(1) DEFAULT 'N',
    inserted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_agent_create_time (create_time),
    INDEX idx_agent_reader_time (reader_name, create_time),
    INDEX idx_agent_tag_time (tag, create_time),
    INDEX idx_agent_processed (processed_yn)
);

CREATE TABLE inspection_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reader_name VARCHAR(100) NOT NULL,
    base_count INT DEFAULT 16,
    read_window_sec INT DEFAULT 3,
    stable_sec INT DEFAULT 3,
    exit_wait_sec INT DEFAULT 10,
    reset_sec INT DEFAULT 3,
    api_url VARCHAR(500) NULL,
    api_timeout_sec INT DEFAULT 5,
    use_yn CHAR(1) DEFAULT 'Y',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_config_reader (reader_name)
);

CREATE TABLE inspection_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_no VARCHAR(50) NOT NULL,
    reader_name VARCHAR(100) NULL,
    status VARCHAR(30) NOT NULL,
    representative_type VARCHAR(20) NULL,
    representative_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    base_count INT DEFAULT 16,
    first_detected_at DATETIME NULL,
    last_detected_at DATETIME NULL,
    stable_started_at DATETIME NULL,
    confirmed_at DATETIME NULL,
    api_status VARCHAR(30) DEFAULT 'NOT_SENT',
    api_sent_at DATETIME NULL,
    api_response_code VARCHAR(50) NULL,
    api_response_message TEXT NULL,
    exit_started_at DATETIME NULL,
    reset_started_at DATETIME NULL,
    reset_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_no (session_no),
    INDEX idx_session_status (status),
    INDEX idx_session_reader_created (reader_name, created_at),
    INDEX idx_session_api_status (api_status)
);

CREATE TABLE inspection_session_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    tag VARCHAR(255) NOT NULL,
    pallet_type VARCHAR(20) NULL,
    reader_name VARCHAR(100) NULL,
    ant_name VARCHAR(100) NULL,
    ant_seq INT NULL,
    ip_address VARCHAR(100) NULL,
    first_seen_at DATETIME NULL,
    last_seen_at DATETIME NULL,
    read_count INT DEFAULT 1,
    is_representative CHAR(1) DEFAULT 'N',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_tag (session_id, tag),
    INDEX idx_session_tag_session (session_id),
    INDEX idx_session_tag_type (session_id, pallet_type),
    INDEX idx_session_tag_tag (tag)
);

CREATE TABLE inspection_api_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    api_url VARCHAR(500) NULL,
    request_body LONGTEXT NULL,
    response_body LONGTEXT NULL,
    http_status INT NULL,
    result VARCHAR(30) NULL,
    error_message TEXT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    INDEX idx_api_log_session (session_id),
    INDEX idx_api_log_result (result)
);
