package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.OptColumn;
import org.appsec.securityrat.web.dto.FrontendOptionColumnDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FrontendOptionColumnMapper
        extends FrontendMapper<OptColumn, FrontendOptionColumnDto> {

    @Override
    @Mapping(target = "type", source = "entity.optColumnType.name")
    @Mapping(target = "visibleByDefault", source = "entity.isVisibleByDefault")
    public FrontendOptionColumnDto toDto(OptColumn entity);
}
