package org.appsec.securityrat.api.dto.user;

import java.time.Instant;
import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class InternalUserDto implements IdentifiableDto<Long> {
    private Long id;
    
    /**
     * Modifying this value is only supported, if the user instance is created.
     */
    private String login;
    
    private String firstName;
    private String lastName;
    private String email;
    private boolean activated;
    
    private String langKey;
    
    /**
     * The value of this field cannot be changed directly.
     */
    private String activationKey;
    
    /**
     * The value of this field cannot be changed directly.
     */
    private String resetKey;
    
    /**
     * The value of this field cannot be changed directly.
     */
    private Instant resetDate;
    
    private Set<AuthorityDto> authorities;
    
    /**
     * Adding entries to this collection is not supported.
     */
    private Set<PersistentTokenDto> persistentTokens;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
