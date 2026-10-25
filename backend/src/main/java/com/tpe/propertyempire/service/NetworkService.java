package com.tpe.propertyempire.service;

import com.tpe.propertyempire.dto.LevelInfoDTO;
import com.tpe.propertyempire.dto.TeamMemberDTO;
import com.tpe.propertyempire.dto.TreeNodeDTO;
import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.enums.Role;
import com.tpe.propertyempire.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

@Service
public class NetworkService {

    private final UserRepository userRepository;

    public NetworkService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<TeamMemberDTO> getDirectReferrals(String tpeId) {
        List<User> directs = userRepository.findBySponsorId(tpeId);
        List<TeamMemberDTO> result = new ArrayList<>();
        for (User u : directs) {
            TeamMemberDTO dto = TeamMemberDTO.fromUser(u, 1);
            if (u.getSponsorId() != null && !u.getSponsorId().isBlank()) {
                User sponsor = userRepository.findByTpeId(u.getSponsorId()).orElse(null);
                dto.setSponsorName(sponsor != null ? sponsor.getFullName() : "-");
            } else {
                dto.setSponsorName("-");
            }
            result.add(dto);
        }
        return result;
    }

    public List<TeamMemberDTO> getTeamMembers(String tpeId) {
        List<TeamMemberDTO> result = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(tpeId);
        int level = 0;
        int maxLevel = 10;

        while (!queue.isEmpty() && level < maxLevel) {
            level++;
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                String code = queue.poll();
                List<User> directs = userRepository.findBySponsorId(code);
                for (User u : directs) {
                    TeamMemberDTO dto = TeamMemberDTO.fromUser(u, level);
                    if (u.getSponsorId() != null && !u.getSponsorId().isBlank()) {
                        User sponsor = userRepository.findByTpeId(u.getSponsorId()).orElse(null);
                        dto.setSponsorName(sponsor != null ? sponsor.getFullName() : "-");
                    } else {
                        dto.setSponsorName("-");
                    }
                    result.add(dto);
                    queue.add(u.getTpeId());
                }
            }
        }
        return result;
    }

    public TreeNodeDTO getGenerationTree(User rootUser, int maxDepth) {
        return buildTree(rootUser, 0, maxDepth);
    }

    private TreeNodeDTO buildTree(User user, int currentLevel, int maxDepth) {
        TreeNodeDTO node = new TreeNodeDTO(
                user.getId(),
                user.getFullName(),
                user.getTpeId(),
                currentLevel
        );
        if (currentLevel < maxDepth) {
            List<User> children = userRepository.findBySponsorId(user.getTpeId());
            for (User child : children) {
                node.getChildren().add(buildTree(child, currentLevel + 1, maxDepth));
            }
        }
        return node;
    }

    public List<LevelInfoDTO> getLevelInfo(String tpeId) {
        List<LevelInfoDTO> result = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(tpeId);
        int level = 0;
        int maxLevel = 10;

        while (!queue.isEmpty() && level < maxLevel) {
            level++;
            int size = queue.size();
            int count = 0;
            for (int i = 0; i < size; i++) {
                String code = queue.poll();
                List<User> directs = userRepository.findBySponsorId(code);
                count += directs.size();
                for (User u : directs) {
                    queue.add(u.getTpeId());
                }
            }
            if (count > 0) {
                result.add(new LevelInfoDTO(level, count));
            }
        }
        return result;
    }

    public List<TeamMemberDTO> getLevelMembers(String tpeId, int targetLevel) {
        List<TeamMemberDTO> result = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(tpeId);
        int level = 0;
        int maxLevel = 10;

        while (!queue.isEmpty() && level < maxLevel) {
            level++;
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                String code = queue.poll();
                List<User> directs = userRepository.findBySponsorId(code);
                for (User u : directs) {
                    if (level == targetLevel) {
                        TeamMemberDTO dto = TeamMemberDTO.fromUser(u, level);
                        User sponsor = userRepository.findByTpeId(u.getSponsorId()).orElse(null);
                        dto.setSponsorName(sponsor != null ? sponsor.getFullName() : "-");
                        result.add(dto);
                    }
                    queue.add(u.getTpeId());
                }
            }
            if (level >= targetLevel) break;
        }
        return result;
    }

    public int getUserLevel(User user) {
        int level = 0;
        String currentSponsorId = user.getSponsorId();
        int safetyLimit = 50;

        while (currentSponsorId != null && !currentSponsorId.isBlank() && level < safetyLimit) {
            level++;
            User sponsor = userRepository.findByTpeId(currentSponsorId).orElse(null);
            if (sponsor == null || sponsor.getRole() == Role.ADMIN) {
                break;
            }
            currentSponsorId = sponsor.getSponsorId();
        }
        return level;
    }

    public List<TeamMemberDTO> getAllMembers(String filter, String adminTpeId) {
        List<User> users;

        switch (filter.toUpperCase()) {
            case "MY_NETWORK":
                return getTeamMembers(adminTpeId);
            case "INDEPENDENT":
                users = userRepository.findByRole(Role.USER);
                return users.stream()
                        .filter(u -> u.getSponsorId() == null || u.getSponsorId().isBlank())
                        .map(u -> {
                            TeamMemberDTO dto = TeamMemberDTO.fromUser(u, 0);
                            dto.setSponsorName("-");
                            return dto;
                        })
                        .toList();
            default:
                users = userRepository.findByRole(Role.USER);
                return users.stream()
                        .map(u -> {
                            TeamMemberDTO dto = TeamMemberDTO.fromUser(u, 0);
                            if (u.getSponsorId() != null && !u.getSponsorId().isBlank()) {
                                User sponsor = userRepository.findByTpeId(u.getSponsorId()).orElse(null);
                                dto.setSponsorName(sponsor != null ? sponsor.getFullName() : "-");
                            } else {
                                dto.setSponsorName("-");
                            }
                            return dto;
                        })
                        .toList();
        }
    }

    public int getTotalTeamSize(String tpeId) {
        int total = 0;
        Queue<String> queue = new LinkedList<>();
        queue.add(tpeId);
        int maxLevel = 10;
        int level = 0;

        while (!queue.isEmpty() && level < maxLevel) {
            level++;
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                String code = queue.poll();
                List<User> directs = userRepository.findBySponsorId(code);
                total += directs.size();
                for (User u : directs) {
                    queue.add(u.getTpeId());
                }
            }
        }
        return total;
    }
}
