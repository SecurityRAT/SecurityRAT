package org.appsec.securityrat.api.dto.rest;

import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProjectTypeDto extends SimpleDto<Long> {
    private String name;
    private String description;
    private Integer showOrder;
    private Boolean active;
    private Set<StatusColumnDto> statusColumns;
    private Set<OptColumnDto> optColumns;
    
    public ProjectTypeDto() {
        super(Long.class);
    }
}
