package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.domain.Authority;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthorityMapper
        extends IdentifiableMapper<String, Authority, AuthorityDto> {
}
