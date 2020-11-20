package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A TrainingCustomSlideNode.
 */
@Entity
@Table(name = "TRAININGCUSTOMSLIDENODE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="trainingcustomslidenode")
public class TrainingCustomSlideNode implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name")
    private String name;

    @Column(name = "content")
    @Lob
    private String content;

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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

        TrainingCustomSlideNode trainingCustomSlideNode = (TrainingCustomSlideNode) o;

        if ( ! Objects.equals(id, trainingCustomSlideNode.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "TrainingCustomSlideNode{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", content='" + content + "'" +
                ", anchor='" + anchor + "'" +
                '}';
    }
}
