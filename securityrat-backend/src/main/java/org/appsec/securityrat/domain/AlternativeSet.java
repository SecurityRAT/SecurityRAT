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
 * A AlternativeSet.
 */
@Entity
@Table(name = "ALTERNATIVESET")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="alternativeset")
public class AlternativeSet implements Serializable {

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

    @ManyToOne
    @JoinColumn(name = "optcolumn_id")
    private OptColumn optColumn;

    @OneToMany(mappedBy = "alternativeSet")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<AlternativeInstance> alternativeInstances = new HashSet<>();

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

    public OptColumn getOptColumn() {
        return optColumn;
    }

    public void setOptColumn(OptColumn optColumn) {
        this.optColumn = optColumn;
    }

    public Set<AlternativeInstance> getAlternativeInstances() {
        return alternativeInstances;
    }

    public void setAlternativeInstances(Set<AlternativeInstance> alternativeInstances) {
        this.alternativeInstances = alternativeInstances;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        AlternativeSet alternativeSet = (AlternativeSet) o;

        if ( ! Objects.equals(id, alternativeSet.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "AlternativeSet{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
