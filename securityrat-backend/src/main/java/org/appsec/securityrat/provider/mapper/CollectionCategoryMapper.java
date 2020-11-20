package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.CollectionCategoryDto;
import org.appsec.securityrat.domain.CollectionCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CollectionCategoryMapper
        extends IdentifiableMapper<Long, CollectionCategory, CollectionCategoryDto> {
}
