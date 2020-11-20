package org.appsec.securityrat.api.dto;

import lombok.Data;

@Data
public class LoggerDto implements Dto {
    private String name;
    private String level;
}
