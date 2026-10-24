package com.tpe.propertyempire.dto;

import java.util.ArrayList;
import java.util.List;

public class TreeNodeDTO {

    private Long id;
    private String fullName;
    private String tpeId;
    private int level;
    private List<TreeNodeDTO> children;

    public TreeNodeDTO() {
        this.children = new ArrayList<>();
    }

    public TreeNodeDTO(Long id, String fullName, String tpeId, int level) {
        this.id = id;
        this.fullName = fullName;
        this.tpeId = tpeId;
        this.level = level;
        this.children = new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public List<TreeNodeDTO> getChildren() { return children; }
    public void setChildren(List<TreeNodeDTO> children) { this.children = children; }
}
