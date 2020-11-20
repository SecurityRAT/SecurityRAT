package org.appsec.securityrat.web.dto;

import java.util.Set;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendCollectionCategoryDto implements Dto {
    private Long id;
    private String name;
    private String description;
    private Integer showOrder;
    private Set<FrontendCollectionInstanceDto> collectionInstances;
}
