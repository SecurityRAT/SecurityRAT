package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A TrainingBranchNode.
 */
@Entity
@Table(name = "TRAININGBRANCHNODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="trainingbranchnode")
public class TrainingBranchNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "anchor")
    private Integer anchor;

    @ManyToOne
    @JoinColumn(name = "node_id")
    private TrainingTreeNode node;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAnchor() {
        return anchor;
    }

    public void setAnchor(Integer anchor) {
        this.anchor = anchor;
    }

    public TrainingTreeNode getNode() {
        return node;
    }

    public void setNode(TrainingTreeNode trainingTreeNode) {
        this.node = trainingTreeNode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        TrainingBranchNode trainingBranchNode = (TrainingBranchNode) o;

        if ( ! Objects.equals(id, trainingBranchNode.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TrainingBranchNode{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", anchor='" + anchor + "'" +
                '}';
    }
}
