package org.appsec.securityrat.api.dto.rest;

import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.appsec.securityrat.api.dto.SimpleDto;

@Data
@EqualsAndHashCode(callSuper = true)
public class TrainingDto extends SimpleDto<Long> {
    private String name;
    private String description;
    private Boolean allRequirementsSelected;
    private Set<OptColumnDto> optColumns;
    private Set<CollectionInstanceDto> collections;
    private Set<ProjectTypeDto> projectTypes;
    
    public TrainingDto() {
        super(Long.class);
    }
}
