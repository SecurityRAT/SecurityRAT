package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.AlternativeSetDto;
import org.appsec.securityrat.domain.AlternativeSet;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { OptColumnMapper.class })
public interface AlternativeSetMapper
        extends IdentifiableMapper<Long, AlternativeSet, AlternativeSetDto> {
}
