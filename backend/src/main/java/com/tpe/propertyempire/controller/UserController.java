package com.tpe.propertyempire.controller;

import com.tpe.propertyempire.dto.*;
import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.enums.Role;
import com.tpe.propertyempire.repository.UserRepository;
import com.tpe.propertyempire.service.NetworkService;
import com.tpe.propertyempire.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final NetworkService networkService;
    private final UserRepository userRepository;

    public UserController(UserService userService, NetworkService networkService, UserRepository userRepository) {
        this.userService = userService;
        this.networkService = networkService;
        this.userRepository = userRepository;
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User getCurrentUser() {
        return userRepository.findByTpeId(getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String resolveRootCode(String rootCode) {
        if (rootCode != null && !rootCode.isBlank()) {
            userRepository.findByTpeId(rootCode)
                    .orElseThrow(() -> new RuntimeException("User not found for code: " + rootCode));
            return rootCode;
        }
        return getCurrentUserId();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile() {
        UserProfileDTO profile = userService.getProfile(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Profile loaded", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        ApiResponse response = userService.updateProfile(getCurrentUserId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getDashboard() {
        DashboardDTO dashboard = userService.getDashboard(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard loaded", dashboard));
    }

    @GetMapping("/my-directs")
    public ResponseEntity<ApiResponse> getMyDirects(
            @RequestParam(value = "rootCode", required = false) String rootCode) {
        String tpeId = resolveRootCode(rootCode);
        List<TeamMemberDTO> directs = networkService.getDirectReferrals(tpeId);
        return ResponseEntity.ok(ApiResponse.success("Direct referrals loaded", directs));
    }

    @GetMapping("/my-team")
    public ResponseEntity<ApiResponse> getMyTeam(
            @RequestParam(value = "rootCode", required = false) String rootCode) {
        String tpeId = resolveRootCode(rootCode);
        List<TeamMemberDTO> team = networkService.getTeamMembers(tpeId);
        return ResponseEntity.ok(ApiResponse.success("Team loaded", team));
    }

    @GetMapping("/generation-tree")
    public ResponseEntity<ApiResponse> getGenerationTree(
            @RequestParam(value = "rootCode", required = false) String rootCode) {
        User rootUser;
        if (rootCode != null && !rootCode.isBlank()) {
            rootUser = userRepository.findByTpeId(rootCode)
                    .orElseThrow(() -> new RuntimeException("User not found for code: " + rootCode));
        } else {
            rootUser = getCurrentUser();
        }
        TreeNodeDTO tree = networkService.getGenerationTree(rootUser, 5);
        return ResponseEntity.ok(ApiResponse.success("Generation tree loaded", tree));
    }

    @GetMapping("/level-info")
    public ResponseEntity<ApiResponse> getLevelInfo(
            @RequestParam(value = "rootCode", required = false) String rootCode) {
        String tpeId = resolveRootCode(rootCode);
        List<LevelInfoDTO> info = networkService.getLevelInfo(tpeId);
        return ResponseEntity.ok(ApiResponse.success("Level info loaded", info));
    }

    @GetMapping("/level-members")
    public ResponseEntity<ApiResponse> getLevelMembers(
            @RequestParam int level,
            @RequestParam(value = "rootCode", required = false) String rootCode) {
        String tpeId = resolveRootCode(rootCode);
        List<TeamMemberDTO> members = networkService.getLevelMembers(tpeId, level);
        return ResponseEntity.ok(ApiResponse.success("Level members retrieved", members));
    }

    @GetMapping("/all-members")
    public ResponseEntity<ApiResponse> getAllMembers(
            @RequestParam(value = "filter", defaultValue = "ALL") String filter) {
        User user = getCurrentUser();
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access denied. Admin only."));
        }
        List<TeamMemberDTO> members = networkService.getAllMembers(filter, user.getTpeId());
        return ResponseEntity.ok(ApiResponse.success("Members retrieved", members));
    }

    @GetMapping("/referral-link")
    public ResponseEntity<ApiResponse> getReferralLink() {
        User user = getCurrentUser();
        Map<String, String> data = new HashMap<>();
        data.put("tpeId", user.getTpeId());
        data.put("referralLink", "http://localhost:5173/signup?ref=" + user.getTpeId());
        return ResponseEntity.ok(ApiResponse.success("Referral link generated", data));
    }
}
