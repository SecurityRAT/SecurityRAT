package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.StatusColumnValueDto;
import org.appsec.securityrat.domain.StatusColumnValue;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { StatusColumnMapper.class })
public interface StatusColumnValueMapper
        extends IdentifiableMapper<Long, StatusColumnValue, StatusColumnValueDto> {
}
