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
 * A StatusColumn.
 */
@Entity
@Table(name = "STATUSCOLUMN")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="statuscolumn")
public class StatusColumn implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name")
    private String name;

    @Column(name = "description")
    @Lob
    private String description;

    @Column(name = "is_enum")
    private Boolean isEnum;

    @Column(name = "show_order")
    private Integer showOrder;

    @Column(name = "active")
    private Boolean active;

    @OneToMany(mappedBy = "statusColumn", fetch = FetchType.EAGER)
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<StatusColumnValue> statusColumnValues = new HashSet<>();

    @ManyToMany(mappedBy = "statusColumns")
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

    public Boolean getIsEnum() {
        return isEnum;
    }

    public void setIsEnum(Boolean isEnum) {
        this.isEnum = isEnum;
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

    public Set<StatusColumnValue> getStatusColumnValues() {
        return statusColumnValues;
    }

    public void setStatusColumnValues(Set<StatusColumnValue> statusColumnValues) {
        this.statusColumnValues = statusColumnValues;
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

        StatusColumn statusColumn = (StatusColumn) o;

        if ( ! Objects.equals(id, statusColumn.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "StatusColumn{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", isEnum='" + isEnum + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
