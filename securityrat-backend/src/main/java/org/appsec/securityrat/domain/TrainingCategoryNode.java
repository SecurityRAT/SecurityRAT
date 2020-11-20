package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A TrainingCategoryNode.
 */
@Entity
@Table(name = "TRAININGCATEGORYNODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="trainingcategorynode")
public class TrainingCategoryNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    
    @Column(name = "name")
    private String name;

    @ManyToOne
    @JoinColumn(name = "node_id")
    private TrainingTreeNode node;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ReqCategory category;

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

    public TrainingTreeNode getNode() {
        return node;
    }

    public void setNode(TrainingTreeNode trainingTreeNode) {
        this.node = trainingTreeNode;
    }

    public ReqCategory getCategory() {
        return category;
    }

    public void setCategory(ReqCategory reqCategory) {
        this.category = reqCategory;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        TrainingCategoryNode trainingCategoryNode = (TrainingCategoryNode) o;

        if ( ! Objects.equals(id, trainingCategoryNode.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TrainingCategoryNode{" +
                "id=" + id +
                ", name='" + name + "'" +
                '}';
    }
}
