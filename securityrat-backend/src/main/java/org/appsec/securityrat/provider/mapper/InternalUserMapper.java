package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.domain.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { AuthorityMapper.class, PersistentTokenMapper.class })
public interface InternalUserMapper
        extends IdentifiableMapper<Long, User, InternalUserDto> {
}
