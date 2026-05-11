package com.factory.rfidinspection.repository;

import com.factory.rfidinspection.domain.InspectionConfigEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionConfigRepository extends JpaRepository<InspectionConfigEntity, Long> {

    Optional<InspectionConfigEntity> findByReaderNameAndUseYn(String readerName, String useYn);
}
