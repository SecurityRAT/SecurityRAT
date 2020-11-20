package org.appsec.securityrat.api.test.mock;

import java.time.Instant;
import java.util.List;
import org.appsec.securityrat.api.dto.AuditEventDto;
import org.appsec.securityrat.api.dto.AuthenticationConfigDto;
import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.api.dto.LoggerDto;
import org.appsec.securityrat.api.provider.SystemInfo;
import org.springframework.stereotype.Service;

@Service
public class SystemInfoMock implements SystemInfo {
    @Override
    public List<AuthorityDto> getAuthorities() {
        throw new UnsupportedOperationException();
    }

    @Override
    public AuthenticationConfigDto getAuthenticationConfig() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<LoggerDto> getLoggers() {
        throw new UnsupportedOperationException();
    }

    @Override
    public void updateLogger(LoggerDto logger) {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<AuditEventDto> getAuditEvents() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<AuditEventDto> getAuditEvents(
            Instant fromDate,
            Instant toDate) {
        throw new UnsupportedOperationException();
    }
}
