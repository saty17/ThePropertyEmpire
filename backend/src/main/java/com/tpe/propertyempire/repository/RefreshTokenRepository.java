package com.tpe.propertyempire.repository;

import com.tpe.propertyempire.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByTpeId(String tpeId);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
