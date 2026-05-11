package com.factory.rfidinspection.repository;

import com.factory.rfidinspection.domain.InspectionSession;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionSessionRepository extends JpaRepository<InspectionSession, Long> {

    Optional<InspectionSession> findTopByReaderNameOrderByCreatedAtDesc(String readerName);
}
