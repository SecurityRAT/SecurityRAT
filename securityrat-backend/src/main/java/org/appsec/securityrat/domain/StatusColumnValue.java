package org.appsec.securityrat.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;


/**
 * A StatusColumnValue.
 */
@Entity
@Table(name = "STATUSCOLUMNVALUE")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="statuscolumnvalue")
public class StatusColumnValue implements Serializable {

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
    @JoinColumn(name = "statuscolumn_id")
    private StatusColumn statusColumn;

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

    public StatusColumn getStatusColumn() {
        return statusColumn;
    }

    public void setStatusColumn(StatusColumn statusColumn) {
        this.statusColumn = statusColumn;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        StatusColumnValue statusColumnValue = (StatusColumnValue) o;

        if ( ! Objects.equals(id, statusColumnValue.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "StatusColumnValue{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", description='" + description + "'" +
                ", showOrder='" + showOrder + "'" +
                ", active='" + active + "'" +
                '}';
    }
}
