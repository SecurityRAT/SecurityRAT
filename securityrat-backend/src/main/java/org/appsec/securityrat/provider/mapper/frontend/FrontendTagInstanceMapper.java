package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.TagInstance;
import org.appsec.securityrat.web.dto.FrontendTagInstanceDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FrontendTagInstanceMapper
        extends FrontendMapper<TagInstance, FrontendTagInstanceDto> {
}
