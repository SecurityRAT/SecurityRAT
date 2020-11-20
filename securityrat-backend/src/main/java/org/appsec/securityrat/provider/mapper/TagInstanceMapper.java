package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.TagInstanceDto;
import org.appsec.securityrat.domain.TagInstance;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { TagCategoryMapper.class })
public interface TagInstanceMapper
        extends IdentifiableMapper<Long, TagInstance, TagInstanceDto> {
}
