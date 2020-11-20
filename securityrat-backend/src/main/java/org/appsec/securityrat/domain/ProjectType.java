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
 * A ProjectType.
 */
@Entity
@Table(name = "PROJECTTYPE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="projecttype")
public class ProjectType implements Serializable {

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

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "PROJECTTYPE_STATUSCOLUMN",
               joinColumns = @JoinColumn(name="projecttypes_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="statuscolumns_id", referencedColumnName="ID"))
    private Set<StatusColumn> statusColumns = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "PROJECTTYPE_OPTCOLUMN",
               joinColumns = @JoinColumn(name="projecttypes_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="optcolumns_id", referencedColumnName="ID"))
    private Set<OptColumn> optColumns = new HashSet<>();

    @ManyToMany(mappedBy = "projectTypes")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<RequirementSkeleton> requirementSkeletons = new HashSet<>();

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

    public Set<StatusColumn> getStatusColumns() {
        return statusColumns;
    }

    public void setStatusColumns(Set<StatusColumn> statusColumns) {
        this.statusColumns = statusColumns;
    }

    public Set<OptColumn> getOptColumns() {
        return optColumns;
    }

    public void setOptColumns(Set<OptColumn> optColumns) {
        this.optColumns = optColumns;
    }

    public Set<RequirementSkeleton> getRequirementSkeletons() {
        return requirementSkeletons;
    }

    public void setRequirementSkeletons(Set<RequirementSkeleton> requirementSkeletons) {
        this.requirementSkeletons = requirementSkeletons;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ProjectType projectType = (ProjectType) o;

        if ( ! Objects.equals(id, projectType.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ProjectType{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
