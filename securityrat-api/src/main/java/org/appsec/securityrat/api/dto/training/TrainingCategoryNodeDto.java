package org.appsec.securityrat.api.dto.training;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;
import org.appsec.securityrat.api.dto.rest.ReqCategoryDto;

@Data
public class TrainingCategoryNodeDto implements IdentifiableDto<Long> {
    private Long id;
    private String name;
    private TrainingTreeNodeDto node;
    private ReqCategoryDto category;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
