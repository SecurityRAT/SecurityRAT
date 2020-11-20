package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.AlternativeInstance;
import org.appsec.securityrat.web.dto.FrontendAlternativeInstanceDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FrontendAlternativeInstanceMapper
        extends FrontendMapper<AlternativeInstance, FrontendAlternativeInstanceDto> {

    @Override
    @Mapping(target = "requirementId", source = "entity.requirementSkeleton.id")
    public FrontendAlternativeInstanceDto toDto(AlternativeInstance entity);
}
