package com.factory.rfidinspection.repository;

import com.factory.rfidinspection.domain.AgentTagLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentTagLogRepository extends JpaRepository<AgentTagLog, Long> {

    List<AgentTagLog> findByReaderNameAndCreateTimeAfterOrderByCreateTimeAsc(String readerName, LocalDateTime createTime);
}
