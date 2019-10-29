package org.appsec.securityRAT.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A TrainingRequirementNode.
 */
@Entity
@Table(name = "TRAININGREQUIREMENTNODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="trainingrequirementnode")
public class TrainingRequirementNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    

    @ManyToOne
    private TrainingTreeNode node;

    @ManyToOne
    private RequirementSkeleton requirementSkeleton;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TrainingTreeNode getNode() {
        return node;
    }

    public void setNode(TrainingTreeNode trainingTreeNode) {
        this.node = trainingTreeNode;
    }

    public RequirementSkeleton getRequirementSkeleton() {
        return requirementSkeleton;
    }

    public void setRequirementSkeleton(RequirementSkeleton requirementSkeleton) {
        this.requirementSkeleton = requirementSkeleton;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        TrainingRequirementNode trainingRequirementNode = (TrainingRequirementNode) o;

        if ( ! Objects.equals(id, trainingRequirementNode.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TrainingRequirementNode{" +
                "id=" + id +
                '}';
    }
}
