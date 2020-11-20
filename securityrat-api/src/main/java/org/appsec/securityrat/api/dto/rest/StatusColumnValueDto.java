package org.appsec.securityrat.api.dto.rest;

import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class StatusColumnValueDto implements IdentifiableDto<Long> {
    private Long id;
    private String name;
    private String description;
    private Integer showOrder;
    private Boolean active;
    private StatusColumnDto statusColumn;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
