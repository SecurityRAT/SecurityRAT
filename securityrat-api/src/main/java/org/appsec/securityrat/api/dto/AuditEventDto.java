package org.appsec.securityrat.api.dto;

import java.time.Instant;
import java.util.Map;
import lombok.Data;

@Data
public class AuditEventDto implements Dto {
    private Map<String, Object> data;
    private String principal;
    private Instant timestamp;
    private String type;
}
