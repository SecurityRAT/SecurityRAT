package org.appsec.securityrat.provider;

import javax.inject.Inject;

import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.provider.SecurityContext;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.appsec.securityrat.security.AuthoritiesConstants;
import org.appsec.securityrat.security.SecurityUtils;
import org.pac4j.core.profile.UserProfile;
import org.pac4j.springframework.security.authentication.Pac4jAuthentication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class SecurityContextImpl implements SecurityContext {
    @Inject
    private UserManager userManager;

    private static final Logger log = LoggerFactory.getLogger(SecurityContextImpl.class);

    @Override
    public InternalUserDto getCurrentUser() {

        return SecurityUtils.getCurrentUserLogin()
            .map(this.userManager::findByLogin)
            .orElse(getCurrentCasUser());
    }

    private InternalUserDto getCurrentCasUser() {
        if (!SecurityUtils.isCasAuthentication()) {
            return null;
        }

        try {
            Pac4jAuthentication token = (Pac4jAuthentication) SecurityContextHolder.getContext().getAuthentication();
            UserProfile userProfile = token.getProfile();
            InternalUserDto userDto = new InternalUserDto();
            String username = null;
            if (userProfile.getClientName() != null && !userProfile.getClientName().isEmpty())
                username = userProfile.getClientName();
            else if (userProfile.getId() != null && !userProfile.getId().isEmpty())
                username = userProfile.getId();
            userDto.setLogin(username);
            userDto.setFirstName(userProfile.getAttribute("email") != null ?
                userProfile.getAttribute("email").toString() : "");
            userDto.setFirstName(userProfile.getAttribute("firstName") != null ?
                userProfile.getAttribute("firstName").toString() : "");
            userDto.setLastName(userProfile.getAttribute("lastName") != null ?
                userProfile.getAttribute("lastName").toString(): "");
            userDto.setActivated(true);
            userDto.setAuthorities(getGeneralAuthorities());
            return userDto;
        } catch (Exception e) {
            log.error("Could not create user DTO with CAS attributes");
            log.debug(e.getMessage());
            return null;
        }
    }

    public Set<AuthorityDto> getGeneralAuthorities() {
        Set<AuthorityDto> authorities = new HashSet<>();
        AuthorityDto authority = new AuthorityDto();
        authority.setName(AuthoritiesConstants.FRONTEND_USER);
        authorities.add(authority);
        return authorities;
    }
}
