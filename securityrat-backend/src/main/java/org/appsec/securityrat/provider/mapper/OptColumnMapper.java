package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.OptColumnDto;
import org.appsec.securityrat.domain.OptColumn;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { OptColumnTypeMapper.class })
public interface OptColumnMapper
        extends IdentifiableMapper<Long, OptColumn, OptColumnDto> {
}
