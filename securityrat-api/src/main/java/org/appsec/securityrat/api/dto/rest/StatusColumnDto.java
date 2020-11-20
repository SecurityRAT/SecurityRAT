package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class StatusColumnDto extends SimpleDto<Long> {
    private String name;
    private String description;
    private Boolean isEnum;
    private Integer showOrder;
    private Boolean active;
    
    public StatusColumnDto() {
        super(Long.class);
    }
}
