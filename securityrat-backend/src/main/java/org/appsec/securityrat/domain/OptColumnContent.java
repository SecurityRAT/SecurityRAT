package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;


/**
 * A OptColumnContent.
 */
@Entity
@Table(name = "OPTCOLUMNCONTENT")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="optcolumncontent")
public class OptColumnContent implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "content")
    @Lob
    private String content;

    @ManyToOne
    @JoinColumn(name = "optcolumn_id")
    private OptColumn optColumn;

    @ManyToOne
    @JoinColumn(name = "requirementskeleton_id")
    private RequirementSkeleton requirementSkeleton;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public OptColumn getOptColumn() {
        return optColumn;
    }

    public void setOptColumn(OptColumn optColumn) {
        this.optColumn = optColumn;
    }

    public RequirementSkeleton getRequirementSkeleton() {
        return requirementSkeleton;
    }

    public void setRequirementSkeleton(RequirementSkeleton requirementSkeleton) {
        this.requirementSkeleton = requirementSkeleton;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        OptColumnContent optColumnContent = (OptColumnContent) o;

        if ( ! Objects.equals(id, optColumnContent.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "OptColumnContent{" +
                "id=" + id +
                ", content='" + content + "'" +
                '}';
    }
}
