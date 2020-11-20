package org.appsec.securityrat.web.dto;

import java.util.Set;
import java.util.HashSet;
import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;
import org.appsec.securityrat.domain.OptColumnContent;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.appsec.securityrat.domain.TagInstance;
import org.appsec.securityrat.domain.CollectionInstance;

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

    
    public FrontendRequirementDto(){
	}
    /*
    public FrontendRequirementDto(RequirementSkeleton skeleton) {
		this.id = skeleton.getId();
		this.shortName = skeleton.getShortName();
		this.universalId = skeleton.getUniversalId();
		this.description = skeleton.getDescription();
		this.showOrder = skeleton.getShowOrder();

		this.optionColumnContents = new HashSet<FrontendOptionColumnContentDto>();
		Set<OptColumnContent> optColumnContentsForSkeleton = skeleton.getOptColumnContents();
		for (OptColumnContent optColumnContent : optColumnContentsForSkeleton) {
			this.optionColumnContents.add(new FrontendOptionColumnContentDto(optColumnContent));
		}

		this.tagInstanceIds = new HashSet<Long>();
		Set<TagInstance> tagInstances = skeleton.getTagInstances();
		for (TagInstance tagInstance : tagInstances) {
			this.tagInstanceIds.add(tagInstance.getId());
		}

		this.collectionInstances = new HashSet<FrontendCollectionInstanceDto>();
		Set<CollectionInstance> collectionInstanceForSkeleton = skeleton.getCollectionInstances();
		for (CollectionInstance collectionInstance : collectionInstanceForSkeleton) {
			this.collectionInstances.add(new FrontendCollectionInstanceDto(collectionInstance));
		}
	}*/
}
