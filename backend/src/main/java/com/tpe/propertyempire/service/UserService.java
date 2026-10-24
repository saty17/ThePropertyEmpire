package com.tpe.propertyempire.service;

import com.tpe.propertyempire.dto.*;
import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class UserService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private final UserRepository userRepository;
    private final NetworkService networkService;

    public UserService(UserRepository userRepository, NetworkService networkService) {
        this.userRepository = userRepository;
        this.networkService = networkService;
    }

    public UserProfileDTO getProfile(String tpeId) {
        User user = userRepository.findByTpeId(tpeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String sponsorName = null;
        if (user.getSponsorId() != null && !user.getSponsorId().isBlank()) {
            sponsorName = userRepository.findByTpeId(user.getSponsorId())
                    .map(User::getFullName)
                    .orElse(null);
        }

        return UserProfileDTO.fromUser(user, sponsorName);
    }

    @Transactional
    public ApiResponse updateProfile(String tpeId, UpdateProfileRequest request) {
        User user = userRepository.findByTpeId(tpeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getMobile() != null) {
            user.setMobile(request.getMobile());
        }
        if (request.getCountryCode() != null) {
            user.setCountryCode(request.getCountryCode());
        }

        userRepository.save(user);

        String sponsorName = null;
        if (user.getSponsorId() != null && !user.getSponsorId().isBlank()) {
            sponsorName = userRepository.findByTpeId(user.getSponsorId())
                    .map(User::getFullName)
                    .orElse(null);
        }
        return ApiResponse.success("Profile updated successfully", UserProfileDTO.fromUser(user, sponsorName));
    }

    public DashboardDTO getDashboard(String tpeId) {
        User user = userRepository.findByTpeId(tpeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DashboardDTO dto = new DashboardDTO();
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setTpeId(user.getTpeId());
        dto.setCountryCode(user.getCountryCode());
        dto.setRole(user.getRole().name());
        dto.setJoinedDate(user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : null);

        String refCode = user.getTpeId();
        dto.setTotalDirects((int) userRepository.countBySponsorId(refCode));

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        dto.setTodayDirects((int) userRepository.countBySponsorIdAndCreatedAtAfter(refCode, startOfToday));

        dto.setTotalTeamSize(networkService.getTotalTeamSize(refCode));
        dto.setLevel(networkService.getUserLevel(user));

        return dto;
    }
}
