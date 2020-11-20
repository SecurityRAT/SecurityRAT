package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.OptColumn;
import org.appsec.securityrat.web.dto.FrontendOptionColumnAlternativeDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { FrontendAlternativeSetMapper.class })
public interface FrontendOptionColumnAlternativeMapper
        extends FrontendMapper<OptColumn, FrontendOptionColumnAlternativeDto> {
}
