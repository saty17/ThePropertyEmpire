package com.tpe.propertyempire.repository;

import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(Role role);

    Optional<User> findByTpeId(String tpeId);

    boolean existsByTpeId(String tpeId);

    List<User> findBySponsorId(String sponsorId);

    long countBySponsorId(String sponsorId);

    long countBySponsorIdAndCreatedAtAfter(String sponsorId, LocalDateTime after);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    long countBySponsorIdIsNullAndRole(Role role);
}
