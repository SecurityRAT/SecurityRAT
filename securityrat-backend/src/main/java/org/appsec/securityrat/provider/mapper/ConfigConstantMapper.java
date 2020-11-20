package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.ConfigConstantDto;
import org.appsec.securityrat.domain.ConfigConstant;
import org.appsec.securityrat.provider.mapper.IdentifiableMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConfigConstantMapper
        extends IdentifiableMapper<Long, ConfigConstant, ConfigConstantDto> {
}
