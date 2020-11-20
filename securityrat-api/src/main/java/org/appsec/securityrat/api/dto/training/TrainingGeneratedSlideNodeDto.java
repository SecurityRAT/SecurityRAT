package org.appsec.securityrat.api.dto.training;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;
import org.appsec.securityrat.api.dto.rest.OptColumnDto;

@Data
public class TrainingGeneratedSlideNodeDto implements IdentifiableDto<Long> {
    private Long id;
    private TrainingTreeNodeDto node;
    private OptColumnDto optColumn;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
