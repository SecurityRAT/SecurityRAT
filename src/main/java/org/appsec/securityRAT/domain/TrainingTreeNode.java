package org.appsec.securityRAT.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import org.appsec.securityRAT.domain.enumeration.TrainingTreeNodeType;

/**
 * A TrainingTreeNode.
 */
@Entity
@Table(name = "TRAININGTREENODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="trainingtreenode")
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

    @ManyToOne
    private Training training_id;

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

        if ( ! Objects.equals(id, trainingTreeNode.id)) return false;

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
