package org.appsec.securityrat.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A CollectionCategory.
 */
@Entity
@Table(name = "COLLECTIONCATEGORY")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="collectioncategory")
public class CollectionCategory implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name")
    private String name;

    @Column(name = "description")
    @Lob
    private String description;

    @Column(name = "show_order")
    private Integer showOrder;

    @Column(name = "active")
    private Boolean active;

    @OneToMany(mappedBy = "collectionCategory", fetch = FetchType.EAGER)
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<CollectionInstance> collectionInstances = new HashSet<>();

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getShowOrder() {
        return showOrder;
    }

    public void setShowOrder(Integer showOrder) {
        this.showOrder = showOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Set<CollectionInstance> getCollectionInstances() {
        return collectionInstances;
    }

    public void setCollectionInstances(Set<CollectionInstance> collectionInstances) {
        this.collectionInstances = collectionInstances;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        CollectionCategory collectionCategory = (CollectionCategory) o;

        if ( ! Objects.equals(id, collectionCategory.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "CollectionCategory{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
