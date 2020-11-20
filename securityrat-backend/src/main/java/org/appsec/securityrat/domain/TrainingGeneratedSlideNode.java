package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A TrainingGeneratedSlideNode.
 */
@Entity
@Table(name = "TRAININGGENERATEDSLIDENODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="traininggeneratedslidenode")
public class TrainingGeneratedSlideNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    

    @ManyToOne
    @JoinColumn(name = "node_id")
    private TrainingTreeNode node;

    @ManyToOne
    @JoinColumn(name = "optcolumn_id")
    private OptColumn optColumn;

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

    public OptColumn getOptColumn() {
        return optColumn;
    }

    public void setOptColumn(OptColumn optColumn) {
        this.optColumn = optColumn;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        TrainingGeneratedSlideNode trainingGeneratedSlideNode = (TrainingGeneratedSlideNode) o;

        if ( ! Objects.equals(id, trainingGeneratedSlideNode.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TrainingGeneratedSlideNode{" +
                "id=" + id +
                '}';
    }
}
