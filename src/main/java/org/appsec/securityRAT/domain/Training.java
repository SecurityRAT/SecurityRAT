package org.appsec.securityRAT.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.appsec.securityRAT.domain.util.CustomDateTimeDeserializer;
import org.appsec.securityRAT.domain.util.CustomDateTimeSerializer;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.springframework.data.elasticsearch.annotations.Document;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;


/**
 * A Training.
 */
@Entity
@Table(name = "TRAINING")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Document(indexName="training")
public class Training implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Column(name = "last_modified")
    private DateTime last_modified;

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

    public DateTime getLast_modified() {
        return last_modified;
    }

    public void setLast_modified(DateTime last_modified) {
        this.last_modified = last_modified;
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
                ", last_modified='" + last_modified + "'" +
                '}';
    }
}
