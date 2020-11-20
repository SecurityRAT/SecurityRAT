package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.StatusColumnDto;
import org.appsec.securityrat.domain.StatusColumn;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StatusColumnMapper
        extends IdentifiableMapper<Long, StatusColumn, StatusColumnDto> {
}
