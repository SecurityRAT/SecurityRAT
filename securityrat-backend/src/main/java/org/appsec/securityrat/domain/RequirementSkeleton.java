package org.appsec.securityrat.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A RequirementSkeleton.
 */
@Entity
@Table(name = "REQUIREMENTSKELETON")
//@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="requirementskeleton")
public class RequirementSkeleton implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "universal_id")
    private String universalId;

    @Column(name = "short_name")
    private String shortName;

    @Column(name = "description")
    @Lob
    private String description;

    @Column(name = "show_order")
    private Integer showOrder;

    @Column(name = "active")
    private Boolean active;

    @OneToMany(mappedBy = "requirementSkeleton")
    @JsonIgnore
    //@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<OptColumnContent> optColumnContents = new HashSet<>();

    @OneToMany(mappedBy = "requirementSkeleton")
    @JsonIgnore
    //@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<AlternativeInstance> alternativeInstances = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "reqcategory_id")
    private ReqCategory reqCategory;

    @ManyToMany
    //@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "REQUIREMENTSKELETON_TAGINSTANCE",
               joinColumns = @JoinColumn(name="requirementskeletons_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="taginstances_id", referencedColumnName="ID"))
    private Set<TagInstance> tagInstances = new HashSet<>();

    @ManyToMany
    //@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "REQUIREMENTSKELETON_COLLECTIONINSTANCE",
               joinColumns = @JoinColumn(name="requirementskeletons_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="collectioninstances_id", referencedColumnName="ID"))
    private Set<CollectionInstance> collectionInstances = new HashSet<>();

    @ManyToMany
    //@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "REQUIREMENTSKELETON_PROJECTTYPE",
               joinColumns = @JoinColumn(name="requirementskeletons_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="projecttypes_id", referencedColumnName="ID"))
    private Set<ProjectType> projectTypes = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUniversalId() {
        return universalId;
    }

    public void setUniversalId(String universalId) {
        this.universalId = universalId;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
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

    public Set<OptColumnContent> getOptColumnContents() {
        return optColumnContents;
    }

    public void setOptColumnContents(Set<OptColumnContent> optColumnContents) {
        this.optColumnContents = optColumnContents;
    }

    public Set<AlternativeInstance> getAlternativeInstances() {
        return alternativeInstances;
    }

    public void setAlternativeInstances(Set<AlternativeInstance> alternativeInstances) {
        this.alternativeInstances = alternativeInstances;
    }

    public ReqCategory getReqCategory() {
        return reqCategory;
    }

    public void setReqCategory(ReqCategory reqCategory) {
        this.reqCategory = reqCategory;
    }

    public Set<TagInstance> getTagInstances() {
        return tagInstances;
    }

    public void setTagInstances(Set<TagInstance> tagInstances) {
        this.tagInstances = tagInstances;
    }

    public Set<CollectionInstance> getCollectionInstances() {
        return collectionInstances;
    }

    public void setCollectionInstances(Set<CollectionInstance> collectionInstances) {
        this.collectionInstances = collectionInstances;
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

        RequirementSkeleton requirementSkeleton = (RequirementSkeleton) o;

        if ( ! Objects.equals(id, requirementSkeleton.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "RequirementSkeleton{" +
                "id=" + id +
                ", universalId='" + universalId + "'" +
                ", shortName='" + shortName + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
