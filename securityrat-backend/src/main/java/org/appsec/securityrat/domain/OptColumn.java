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
 * A OptColumn.
 */
@Entity
@Table(name = "OPTCOLUMN")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="optcolumn")
public class OptColumn implements Serializable {

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

    @Column(name = "isVisibleByDefault")
    private Boolean isVisibleByDefault;

    @ManyToOne
    @JoinColumn(name = "optcolumntype_id")
    private OptColumnType optColumnType;

    @OneToMany(mappedBy = "optColumn")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<AlternativeSet> alternativeSets = new HashSet<>();

    @OneToMany(mappedBy = "optColumn")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<OptColumnContent> optColumnContents = new HashSet<>();

    @ManyToMany(mappedBy = "optColumns")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<ProjectType> projectTypes = new HashSet<>();

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

    public Boolean getIsVisibleByDefault() {
        return this.isVisibleByDefault;
    }

    public void setIsVisibleByDefault(Boolean isVisibleByDefault) {
        this.isVisibleByDefault = isVisibleByDefault;
    }

    public OptColumnType getOptColumnType() {
        return optColumnType;
    }

    public void setOptColumnType(OptColumnType optColumnType) {
        this.optColumnType = optColumnType;
    }

    public Set<AlternativeSet> getAlternativeSets() {
        return alternativeSets;
    }

    public void setAlternativeSets(Set<AlternativeSet> alternativeSets) {
        this.alternativeSets = alternativeSets;
    }

    public Set<OptColumnContent> getOptColumnContents() {
        return optColumnContents;
    }

    public void setOptColumnContents(Set<OptColumnContent> optColumnContents) {
        this.optColumnContents = optColumnContents;
    }

    public Set<ProjectType> getProjectTypes() {
        return projectTypes;
    }

    public void setProjectTypes(Set<ProjectType> projectTypes) {
        this.projectTypes = projectTypes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        OptColumn optColumn = (OptColumn) o;

        if ( ! Objects.equals(id, optColumn.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "OptColumn{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                ", isVisibleByDefault='" + isVisibleByDefault + "'" +
                '}';
    }
}
