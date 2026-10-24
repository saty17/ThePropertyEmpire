package com.tpe.propertyempire.repository;

import com.tpe.propertyempire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByTpeId(String tpeId);

    boolean existsByTpeId(String tpeId);

    List<User> findBySponsorId(String sponsorId);

    long countBySponsorId(String sponsorId);

    long countBySponsorIdAndCreatedAtAfter(String sponsorId, LocalDateTime after);
}
