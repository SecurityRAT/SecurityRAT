package org.appsec.securityrat.api.dto.rest;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class RequirementSkeletonDto implements IdentifiableDto<Long> {
    private Long id;
    private String universalId;
    private String shortName;
    private String description;
    private Integer showOrder;
    private Boolean active;
    private ReqCategoryDto reqCategory;
    private Set<TagInstanceDto> tagInstances;
    private Set<CollectionInstanceDto> collectionInstances;
    private Set<ProjectTypeDto> projectTypes;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
