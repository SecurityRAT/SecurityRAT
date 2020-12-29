package org.appsec.securityrat.web.dto;

import java.util.Set;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class FrontendRequirementDto implements Dto {
    private Long id;
    private String shortName;
    private String universalId;
    private String description;
    private Integer showOrder;
    private Set<FrontendOptionColumnContentDto> optionColumnContents;
    private Set<Long> tagInstanceIds;
    private Set<FrontendCollectionInstanceDto> collectionInstances;


    public FrontendRequirementDto() {
    }
}
