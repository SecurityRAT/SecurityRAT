package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A Training.
 */
@Entity
@Table(name = "TRAINING")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="training")
public class Training extends AbstractAuditingEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name")
    private String name;

    @Column(name = "description")
    @Lob
    private String description;

    @Column(name = "all_requirements_selected")
    private Boolean allRequirementsSelected;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "TRAINING_OPTCOLUMN",
               joinColumns = @JoinColumn(name="trainings_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="optcolumns_id", referencedColumnName="ID"))
    private Set<OptColumn> optColumns = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "TRAINING_COLLECTION",
               joinColumns = @JoinColumn(name="trainings_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="collections_id", referencedColumnName="ID"))
    private Set<CollectionInstance> collections = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "TRAINING_PROJECTTYPE",
               joinColumns = @JoinColumn(name="trainings_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="projecttypes_id", referencedColumnName="ID"))
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

    public Boolean getAllRequirementsSelected() {
        return allRequirementsSelected;
    }

    public void setAllRequirementsSelected(Boolean allRequirementsSelected) {
        this.allRequirementsSelected = allRequirementsSelected;
    }

    public Set<OptColumn> getOptColumns() {
        return optColumns;
    }

    public void setOptColumns(Set<OptColumn> optColumns) {
        this.optColumns = optColumns;
    }

    public Set<CollectionInstance> getCollections() {
        return collections;
    }

    public void setCollections(Set<CollectionInstance> collectionInstances) {
        this.collections = collectionInstances;
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

        Training training = (Training) o;

        if ( ! Objects.equals(id, training.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Training{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", allRequirementsSelected='" + allRequirementsSelected + "'" +
                '}';
    }
}
