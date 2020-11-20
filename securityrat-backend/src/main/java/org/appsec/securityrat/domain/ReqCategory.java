package org.appsec.securityrat.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;


/**
 * A ReqCategory.
 */
@Entity
@Table(name = "REQCATEGORY")
//@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="reqcategory")
public class ReqCategory implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name")
    private String name;

    @Column(name = "shortcut")
    private String shortcut;

    @Column(name = "description")
    @Lob
    private String description;

    @Column(name = "show_order")
    private Integer showOrder;

    @Column(name = "active")
    private Boolean active;

    @OneToMany(mappedBy = "reqCategory")
    @JsonIgnore
    //@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
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

    public String getShortcut() {
        return shortcut;
    }

    public void setShortcut(String shortcut) {
        this.shortcut = shortcut;
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

        ReqCategory reqCategory = (ReqCategory) o;

        if ( ! Objects.equals(id, reqCategory.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ReqCategory{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", shortcut='" + shortcut + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
