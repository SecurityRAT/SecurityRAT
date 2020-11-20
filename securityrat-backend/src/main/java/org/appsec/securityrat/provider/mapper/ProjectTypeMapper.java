package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.ProjectTypeDto;
import org.appsec.securityrat.domain.ProjectType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { StatusColumnMapper.class, OptColumnMapper.class })
public interface ProjectTypeMapper
        extends IdentifiableMapper<Long, ProjectType, ProjectTypeDto> {
}
