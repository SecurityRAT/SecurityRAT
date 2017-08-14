package org.appsec.securityRAT.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import javax.servlet.annotation.HttpConstraint;
import java.io.Serializable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Objects;

import org.appsec.securityRAT.domain.enumeration.TrainingTreeNodeType;

/**
 * A TrainingTreeNode.
 */
@Entity
@Table(name = "TRAININGTREENODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName = "trainingtreenode")
public class TrainingTreeNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    
    @Enumerated(EnumType.STRING)
    @Column(name = "node_type")
    private TrainingTreeNodeType node_type;
    
    @Column(name = "sort_order")
    private Integer sort_order;

    @ManyToOne
    private TrainingTreeNode parent_id;
    @Transient
    private String content;
    @Transient
    private String name;
    @Transient
    private TrainingCustomSlideNode customSlideNode;
    @Transient
    private TrainingGeneratedSlideNode generatedSlideNode;
    @Transient
    private TrainingBranchNode branchNode;
    @Transient
    private TrainingRequirementNode requirementNode;
    @Transient
    private TrainingCategoryNode categoryNode;
    @Transient
    private List<TrainingTreeNode> children;
    @ManyToOne
    private Training training_id;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TrainingCategoryNode getCategoryNode() {
        return categoryNode;
    }

    public void setCategoryNode(TrainingCategoryNode categoryNode) {
        this.categoryNode = categoryNode;
    }

    public TrainingRequirementNode getRequirementNode() {
        return requirementNode;
    }

    public void setRequirementNode(TrainingRequirementNode requirementNode) {
        this.requirementNode = requirementNode;
    }

    public TrainingBranchNode getBranchNode() {
        return branchNode;
    }

    public void setBranchNode(TrainingBranchNode branchNode) {
        this.branchNode = branchNode;
    }

    public List<TrainingTreeNode> getChildren() {
        return children;
    }

    public void setChildren(List<TrainingTreeNode> children) {
        this.children = children;
    }

    public TrainingCustomSlideNode getCustomSlideNode() {
        return customSlideNode;
    }

    public void setCustomSlideNode(TrainingCustomSlideNode customSlideNode) {
        this.customSlideNode = customSlideNode;
    }

    public TrainingGeneratedSlideNode getGeneratedSlideNode() {
        return generatedSlideNode;
    }

    public void setGeneratedSlideNode(TrainingGeneratedSlideNode generatedSlideNode) {
        this.generatedSlideNode = generatedSlideNode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TrainingTreeNodeType getNode_type() {
        return node_type;
    }

    public void setNode_type(TrainingTreeNodeType node_type) {
        this.node_type = node_type;
    }

    public Integer getSort_order() {
        return sort_order;
    }

    public void setSort_order(Integer sort_order) {
        this.sort_order = sort_order;
    }

    public TrainingTreeNode getParent_id() {
        return parent_id;
    }

    public void setParent_id(TrainingTreeNode trainingTreeNode) {
        this.parent_id = trainingTreeNode;
    }

    public Training getTraining_id() {
        return training_id;
    }

    public void setTraining_id(Training training) {
        this.training_id = training;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        TrainingTreeNode trainingTreeNode = (TrainingTreeNode) o;

        if (!Objects.equals(id, trainingTreeNode.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TrainingTreeNode{" +
            "id=" + id +
            ", node_type='" + node_type + "'" +
            ", sort_order='" + sort_order + "'" +
            '}';
    }
}
