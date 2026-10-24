package com.tpe.propertyempire.dto;

public class LevelInfoDTO {

    private int level;
    private int memberCount;

    public LevelInfoDTO() {}

    public LevelInfoDTO(int level, int memberCount) {
        this.level = level;
        this.memberCount = memberCount;
    }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }
}
