package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.OptColumnTypeDto;
import org.appsec.securityrat.domain.OptColumnType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OptColumnTypeMapper
        extends IdentifiableMapper<Long, OptColumnType, OptColumnTypeDto> {
}
