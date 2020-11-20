package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.AlternativeInstanceDto;
import org.appsec.securityrat.domain.AlternativeInstance;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { AlternativeSetMapper.class, RequirementSkeletonMapper.class })
public interface AlternativeInstanceMapper
        extends IdentifiableMapper<Long, AlternativeInstance, AlternativeInstanceDto> {
}
