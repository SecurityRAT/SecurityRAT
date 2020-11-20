package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.SlideTemplateDto;
import org.appsec.securityrat.domain.SlideTemplate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SlideTemplateMapper
        extends IdentifiableMapper<Long, SlideTemplate, SlideTemplateDto> {
}
