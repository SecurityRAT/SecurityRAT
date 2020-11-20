package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.StatusColumn;
import org.appsec.securityrat.web.dto.FrontendStatusColumnDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = { FrontendStatusColumnValueMapper.class })
public interface FrontendStatusColumnMapper
        extends FrontendMapper<StatusColumn, FrontendStatusColumnDto> {

    @Override
    @Mapping(target = "values", source = "entity.statusColumnValues")
    public FrontendStatusColumnDto toDto(StatusColumn entity);
}
