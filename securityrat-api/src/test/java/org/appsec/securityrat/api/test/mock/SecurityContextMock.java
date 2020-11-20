package org.appsec.securityrat.api.test.mock;

import org.appsec.securityrat.api.dto.user.InternalUserDto;
import org.appsec.securityrat.api.provider.SecurityContext;
import org.springframework.stereotype.Service;

@Service
public class SecurityContextMock implements SecurityContext {
    @Override
    public InternalUserDto getCurrentUser() {
        throw new UnsupportedOperationException();
    }
}
