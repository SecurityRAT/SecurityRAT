package org.appsec.securityrat.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;

/**
 * A TrainingTreeNode.
 */
@Entity
@Table(name = "TRAININGTREENODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName = "trainingtreenode")
public class TrainingTreeNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "node_type")
    private TrainingTreeNodeType node_type;

    @Column(name = "sort_order")
    private Integer sort_order;

    @Column(name = "active")
    private Boolean active;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "parent_id_id")
    private TrainingTreeNode parent_id;

    @Transient
    private String content;

    @Transient
    private String name;

    @Transient
    private boolean opened;

    @Transient
    private List<TrainingTreeNode> children;

    @Transient
    private Integer anchor;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "training_id_id")
    private Training training_id;

    // JSON transfer attribute for training_id
    @Transient
    private Long json_training_id;

    // JSON transfer attribute for database links
    @Transient
    private Long json_universal_id;

    public Integer getAnchor() {
        return anchor;
    }

    public void setAnchor(Integer anchor) {
        this.anchor = anchor;
    }

    public Long getJson_universal_id() {
        return json_universal_id;
    }

    public void setJson_universal_id(Long json_universal_id) {
        this.json_universal_id = json_universal_id;
    }

    public Long getJson_training_id() {
        return json_training_id;
    }

    public void setJson_training_id(Long json_training_id) {
        this.json_training_id = json_training_id;
    }

    public boolean isOpened() {
        return opened;
    }

    public void setOpened(boolean opened) {
        this.opened = opened;
    }

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

    public List<TrainingTreeNode> getChildren() {
        return children;
    }

    public void setChildren(List<TrainingTreeNode> children) {
        this.children = children;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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
            ", active='" + active + "'" +
            '}';
    }
}
