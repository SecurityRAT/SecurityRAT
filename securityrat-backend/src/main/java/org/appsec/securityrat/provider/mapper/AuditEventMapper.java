package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.AuditEventDto;
import org.mapstruct.Mapper;
import org.springframework.boot.actuate.audit.AuditEvent;

@Mapper(componentModel = "spring")
public interface AuditEventMapper {
    AuditEventDto toDto(AuditEvent event);
}
