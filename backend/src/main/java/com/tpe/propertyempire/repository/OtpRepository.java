package com.tpe.propertyempire.repository;

import com.tpe.propertyempire.entity.Otp;
import com.tpe.propertyempire.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findTopByEmailAndOtpTypeAndUsedFalseOrderByIdDesc(String email, OtpType otpType);

    Optional<Otp> findTopByTpeIdAndOtpTypeAndUsedFalseOrderByIdDesc(String tpeId, OtpType otpType);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
