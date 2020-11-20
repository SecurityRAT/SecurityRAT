package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.TagCategoryDto;
import org.appsec.securityrat.domain.TagCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagCategoryMapper
        extends IdentifiableMapper<Long, TagCategory, TagCategoryDto> {
}
