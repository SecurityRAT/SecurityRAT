package org.appsec.securityrat.provider;

import javax.inject.Inject;
import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.provider.SecurityContext;
import org.appsec.securityrat.api.provider.advanced.UserManager;
import org.appsec.securityrat.security.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
public class SecurityContextImpl implements SecurityContext {
    @Inject
    private UserManager userManager;
    
    @Override
    public InternalUserDto getCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
                .map(this.userManager::findByLogin)
                .orElse(null);
    }
}
