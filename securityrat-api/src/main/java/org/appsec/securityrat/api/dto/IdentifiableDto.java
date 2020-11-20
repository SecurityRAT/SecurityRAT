package org.appsec.securityrat.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Represents a data transfer object that is identifiable by a unique
 * identifier.
 * 
 * @param <TId> The type of the identifier.
 */
public interface IdentifiableDto<TId> extends Dto {
    /**
     * Returns the unique identifier of this data transfer object instance.
     * <p>
     * The return value may be <code>null</code>, if the data transfer object
     * was newly created and does not have an identifier yet. If an DTO is
     * transferred between the client and the server, <code>null</code> is only
     * a valid identifier for DTOs that are sent from the client to server. Data
     * transfer objects that are sent as response to a request by the server
     * always have to provide a non-null identifier.
     * 
     * @return Either the identifier or <code>null</code>.
     */
    TId getId();
    
    /**
     * Sets the unique identifier for this data transfer object instance.
     * <p>
     * The passed <code>identifier</code> may be <code>null</code>, if the
     * instance was newly created and there is no associated identifier at the
     * moment.
     * 
     * @param identifier Either the unique identifier or <code>null</code>.
     */
    void setId(TId identifier);
    
    // NOTE: The following method 'getIdentifierClass' is required because
    //       Java's implementation of generics has some limitations at runtime
    //       and may not be available at all (if using an obfuscator).
    
    /**
     * Returns the class of the data transfer object's unique identifier.
     * 
     * @return The class of the unique identifier.
     */
    @JsonIgnore
    Class<TId> getIdentifierClass();
}
