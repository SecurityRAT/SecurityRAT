package org.appsec.securityrat.api.dto.user;

import java.time.Instant;
import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class UserDto implements IdentifiableDto<Long> {
    public static UserDto fromInternal(
            InternalUserDto user,
            boolean includeAuthorities) {
        UserDto dto = new UserDto();
        
        dto.setId(user.getId());
        dto.setLogin(user.getLogin());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setActivated(user.isActivated());
        dto.setLangKey(user.getLangKey());
        dto.setResetKey(user.getResetKey());
        dto.setResetDate(user.getResetDate());
        
        if (includeAuthorities) {
            dto.setAuthorities(user.getAuthorities());
        } else {
            dto.setAuthorities(null);
        }
        
        return dto;
    }
    
    public static InternalUserDto toInternal(UserDto user) {
        InternalUserDto dto = new InternalUserDto();
        
        dto.setId(user.getId());
        dto.setLogin(user.getLogin());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setActivated(user.isActivated());
        dto.setLangKey(user.getLangKey());
        dto.setResetKey(user.getResetKey());
        dto.setResetDate(user.getResetDate());
        dto.setAuthorities(user.getAuthorities());
        
        return dto;
    }
    
    private Long id;
    private String login;
    private String firstName;
    private String lastName;
    private String email;
    private boolean activated;
    private String langKey;
    private String resetKey;
    private Instant resetDate;
    private Set<AuthorityDto> authorities;

    @Override
    public Long getId() {
        return this.id;
    }

    @Override
    public void setId(Long identifier) {
        this.id = identifier;
    }

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
