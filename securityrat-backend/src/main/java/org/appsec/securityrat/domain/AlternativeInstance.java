package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A AlternativeInstance.
 */
@Entity
@Table(name = "ALTERNATIVEINSTANCE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="alternativeinstance")
public class AlternativeInstance implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "content")
    @Lob
    private String content;

    @ManyToOne
    @JoinColumn(name = "alternativeset_id")
    private AlternativeSet alternativeSet;

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

    public AlternativeSet getAlternativeSet() {
        return alternativeSet;
    }

    public void setAlternativeSet(AlternativeSet alternativeSet) {
        this.alternativeSet = alternativeSet;
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

        AlternativeInstance alternativeInstance = (AlternativeInstance) o;

        if ( ! Objects.equals(id, alternativeInstance.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "AlternativeInstance{" +
                "id=" + id +
                ", content='" + content + "'" +
                '}';
    }
}
