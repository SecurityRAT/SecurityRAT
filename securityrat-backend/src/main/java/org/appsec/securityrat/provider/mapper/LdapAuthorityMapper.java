package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.AuthorityDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.security.ldap.userdetails.LdapAuthority;

@Mapper(componentModel = "spring")
public abstract class LdapAuthorityMapper {

	@Mapping(source = "authority", target = "name")
	@Mapping(target = "id", ignore = true)
	public abstract AuthorityDto toDto(LdapAuthority entity);

	public LdapAuthority toEntity(AuthorityDto dto) {
		return new LdapAuthority(dto.getName(), "");
	}
}
