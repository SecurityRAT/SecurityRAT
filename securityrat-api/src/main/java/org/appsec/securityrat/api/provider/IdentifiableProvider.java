package org.appsec.securityrat.api.provider;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.IdentifiableDto;

/**
 * Interface of all DTOs that are more advanced than
 * {@link org.appsec.securityrat.api.dto.SimpleDto} but implement the same
 * mechanisms.
 * 
 * @param <TId> The type of the DTOs unique identifier.
 * @param <TDto> The type of the DTO
 */
public interface IdentifiableProvider<TId, TDto extends IdentifiableDto<TId>> {
    /**
     * Stores the new <code>dto</code> instance in the persistent storage.
     * 
     * It is required that the <code>dto</code>'s unique identifier is still
     * <code>null</code>, otherwise the method will always fail.
     * 
     * @param dto The new instance.
     * @return Either <code>true</code>, if the operation succeeded,
     *         <code>false</code> otherwise.
     */
    boolean create(TDto dto);
    
    /**
     * Updates the <code>dto</code> instance in the persistent storage.
     * 
     * @param dto The modified instance with a valid unique identifier.
     * @return Either <code>true</code>, if the operation succeeded,
     *         otherwise <code>false</code>.
     */
    boolean update(TDto dto);
    
    /**
     * Removes the DTO instance with the specified <code>id</code> from the
     * persistent storage.
     * 
     * @param id The unique identifier of the DTO which shall be removed.
     * @return Either <code>true</code>, if the operation succeeded, otherwise
     *         <code>false</code>.
     */
    boolean delete(TId id);
    
    /**
     * Resolves the DTO with the specified <code>id</code>.
     * 
     * @param id The unique identifier of the resolved DTO.
     * @return Either the resolved instance or <code>null</code>, if there is no
     *         instance that is associated with the specified <code>id</code>.
     */
    TDto find(TId id);
    
    /**
     * Resolves all DTOs that are stored in the persistent storage.
     * 
     * @return All DTOs stored in the persistent storage or <code>null</code>,
     *         if an error occurs.
     */
    Set<TDto> findAll();
    
    /**
     * Performs a Elasticsearch query for DTOs.
     * 
     * @param query The Elasticsearch query.
     * @return The result set or <code>null</code>, if an error occurs.
     */
    List<TDto> search(String query);
}
