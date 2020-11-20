package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class AlternativeSetDto extends SimpleDto<Long> {
    private String name;
    private String description;
    private Integer showOrder;
    private Boolean active;
    private OptColumnDto optColumn;
    
    public AlternativeSetDto() {
        super(Long.class);
    }
}
