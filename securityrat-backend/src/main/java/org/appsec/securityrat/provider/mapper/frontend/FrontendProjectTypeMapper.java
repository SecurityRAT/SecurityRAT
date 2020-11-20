package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.web.dto.FrontendProjectTypeDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = {
            FrontendOptionColumnMapper.class,
            FrontendStatusColumnMapper.class
        })
public interface FrontendProjectTypeMapper
        extends FrontendMapper<ProjectType, FrontendProjectTypeDto> {

    @Override
    @Mapping(target = "optionColumns", source = "entity.optColumns")
    public FrontendProjectTypeDto toDto(ProjectType entity);
}
