package org.appsec.securityrat.api.provider;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.SimpleDto;

/**
 * Manages all instances of all implementations of {@link SimpleDto}.
 */
public interface PersistentStorage {
    /**
     * Assigns a unique identifier to the specified <code>dto</code> and stores
     * the <code>dto</code> in the persistent storage.
     * <p>
     * If the {@link SimpleDto#id} is not <code>null</code>, this method will
     * always fail and return <code>false</code>.
     * 
     * @param <TId> The type of the DTO's unique identifier.
     * @param <TSimpleDto> The type of the data transfer object.
     * 
     * @param dto The data transfer object that will be stored in the persistent
     *            storage.
     * 
     * @return Either <code>true</code>, if storing the passed <code>dto</code>
     *         succeeded, otherwise <code>false</code>, if not.
     */
    <TId, TSimpleDto extends SimpleDto<TId>> boolean create(TSimpleDto dto);
    
    /**
     * Updates the stored version of the passed <code>dto</code> with the
     * information of the <code>dto</code>.
     * <p>
     * If the {@link SimpleDto#id} is <code>null</code>, this method will always
     * fail and return <code>false</code>.
     * 
     * @param <TId> The type of the DTO's unique identifier.
     * @param <TSimpleDto> The type of the data transfer object.
     * 
     * @param dto The data transfer object that will be used for updating its
     *            stored representation.
     * 
     * @return Either <code>true</code>, if updating the stored representation
     *         succeeds, otherwise <code>false</code>.
     */
    <TId, TSimpleDto extends SimpleDto<TId>> boolean update(TSimpleDto dto);
    
    /**
     * Deletes the stored representation of the data transfer object that is
     * associated with the passed <code>id</code> from the persistent storage.
     * 
     * @param <TId> The type of the DTO's unique identifier.
     * @param <TSimpleDto> The type of the data transfer object.
     * 
     * @param id The unique identifier of the data transfer object which will be
     *           removed.
     * 
     * @param simpleDtoClass The class of the data transfer object.
     * 
     * @return Either <code>true</code>, if the stored representation has been
     *         deleted, otherwise <code>false</code>.
     */
    <TId, TSimpleDto extends SimpleDto<TId>> boolean delete(TId id,
            Class<TSimpleDto> simpleDtoClass);
    
    /**
     * Resolves the stored representation of the data transfer object which is
     * associated with the specified <code>id</code> form the persistent
     * storage.
     * 
     * @param <TId> The type of the DTO's unique identifier.
     * @param <TSimpleDto> The type of the data transfer object.
     * 
     * @param id The unique identifier of the data transfer object which will be
     *           resolved.
     * 
     * @param simpleDtoClass The class of the data transfer object.
     * 
     * @return Either an instance of <code>TSimpleDto</code> or
     *         <code>null</code>, if the passed <code>id</code> could not be
     *         resolved.
     */
    <TId, TSimpleDto extends SimpleDto<TId>> TSimpleDto find(TId id,
            Class<TSimpleDto> simpleDtoClass);
    
    /**
     * Resolves all stored instances of <code>TSimpleDto</code>.
     * 
     * @param <TSimpleDto> The type of the DTOs' unique identifier.
     * @param <TId> The type of the DTO's unique identifier.
     * 
     * @param simpleDtoClass The class of the data transfer objects.
     * 
     * @return A {@link Set} of all stored instances of <code>TSimpleDto</code>
     *         or <code>null</code>, if an error occurs.
     */
    <TId, TSimpleDto extends SimpleDto<TId>> Set<TSimpleDto> findAll(
            Class<TSimpleDto> simpleDtoClass);
    
    /**
     * Retrieves all stored instances of <code>TSimpleDto</code> that match the
     * passed Elasticsearch <code>query</code>.
     * 
     * @param <TSimpleDto> The type of the DTOs' unique identifier.
     * @param <TId> The type of the DTO's unique identifier.
     * 
     * @param query The Elasticsearch query.
     * @param simpleDtoClass The class of the data transfer objects.
     * 
     * @return Either result set as {@link List} or <code>null</code>, if an
     *         error occurs.
     */
    <TId, TSimpleDto extends SimpleDto<TId>> List<TSimpleDto> search(
            String query, Class<TSimpleDto> simpleDtoClass);
}
