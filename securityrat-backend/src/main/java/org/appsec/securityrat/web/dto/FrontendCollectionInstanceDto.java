package org.appsec.securityrat.web.dto;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;
import org.appsec.securityrat.domain.CollectionInstance;

@Data
public class FrontendCollectionInstanceDto implements Dto {
    private Long id;
    private String name;
    private String description;
    private Integer showOrder;

    public FrontendCollectionInstanceDto() {

    }
    
    public FrontendCollectionInstanceDto(CollectionInstance collectionInstance) {
		this.id = collectionInstance.getId();
		this.name = collectionInstance.getName();
		this.description = collectionInstance.getDescription();
		this.showOrder = collectionInstance.getShowOrder();
    }
}
