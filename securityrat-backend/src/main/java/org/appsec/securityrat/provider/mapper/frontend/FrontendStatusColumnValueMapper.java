package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.StatusColumnValue;
import org.appsec.securityrat.web.dto.FrontendStatusColumnValueDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FrontendStatusColumnValueMapper
        extends FrontendMapper<StatusColumnValue, FrontendStatusColumnValueDto> {
}
