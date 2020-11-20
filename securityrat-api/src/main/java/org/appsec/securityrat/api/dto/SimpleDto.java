package org.appsec.securityrat.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;

/**
 * A simple data transfer object that behaves normal and is manageable by the
 * {@link org.appsec.securityrat.api.provider.PersistentStorage}.
 * <p>
 * A data transfer object is considered to be <i>simple</i>, if all of the
 * following requirements are met:
 * 
 * <ul>
 *   <li>
 *     Each instance of the data transfer object is identifiable by a unique
 *     identifier.
 *   </li>
 *   <li>
 *     Only the following operations are supported, but all of them need to be
 *     implemented:
 * 
 *     <ul>
 *       <li>Creating a new instance.</li>
 *       <li>Updating all details but the unique identifier.</li>
 *       <li>Querying all instances at once.</li>
 *       <li>Querying instances based on an Elasticsearch query.</li>
 *       <li>Querying a single instance by its unique identifier.</li>
 *       <li>Deleting an instance.</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * @param <TId> The type of the identifier.
 */
@Data
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class SimpleDto<TId> implements IdentifiableDto<TId> {
    @JsonIgnore
    private final Class<TId> identifierClass;
    private TId id;
}
