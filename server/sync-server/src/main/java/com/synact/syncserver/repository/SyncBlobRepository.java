package com.synact.syncserver.repository;

import com.synact.syncserver.domain.SyncBlob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SyncBlobRepository extends JpaRepository<SyncBlob, Long> {
    Optional<SyncBlob> findByUserIdAndAppId(Long userId, String appId);
}
