package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.OptColumnContent;
import org.appsec.securityrat.web.dto.FrontendOptionColumnContentDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FrontendOptionColumnContentMapper
        extends FrontendMapper<OptColumnContent, FrontendOptionColumnContentDto> {

    @Override
    @Mapping(target = "optionColumnId", source = "entity.optColumn.id")
    @Mapping(target = "optionColumnName", source = "entity.optColumn.name")
    public FrontendOptionColumnContentDto toDto(OptColumnContent entity);
}
