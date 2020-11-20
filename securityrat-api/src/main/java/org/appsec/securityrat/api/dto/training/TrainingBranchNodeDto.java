package org.appsec.securityrat.api.dto.training;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class TrainingBranchNodeDto implements IdentifiableDto<Long> {
    private Long id;
    private String name;
    private Integer anchor;
    private TrainingTreeNodeDto node;
    
    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
