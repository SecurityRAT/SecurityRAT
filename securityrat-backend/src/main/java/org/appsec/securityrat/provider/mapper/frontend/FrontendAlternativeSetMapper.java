package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.AlternativeSet;
import org.appsec.securityrat.web.dto.FrontendAlternativeSetDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FrontendAlternativeSetMapper
        extends FrontendMapper<AlternativeSet, FrontendAlternativeSetDto> {
}
