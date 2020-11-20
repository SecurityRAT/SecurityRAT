package org.appsec.securityrat.provider.mapper.frontend;

import java.util.stream.Collectors;
import javax.inject.Inject;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.appsec.securityrat.web.dto.FrontendRequirementDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public abstract class FrontendRequirementMapper
        implements FrontendMapper<RequirementSkeleton, FrontendRequirementDto> {
    
    @Inject
    private FrontendOptionColumnContentMapper frontendOptionColumnContentMapper;

    @Inject
    private FrontendCollectionInstanceMapper frontendCollectionInstanceMapper;

    @Override
    public FrontendRequirementDto toDto(RequirementSkeleton entity) {
        FrontendRequirementDto dto = new FrontendRequirementDto();
        
        dto.setId(entity.getId());
        dto.setShortName(entity.getShortName());
        dto.setUniversalId(entity.getUniversalId());
        dto.setDescription(entity.getDescription());
        dto.setShowOrder(entity.getShowOrder());
        dto.setOptionColumnContents(
                entity.getOptColumnContents()
                        .stream()
                        .map(this.frontendOptionColumnContentMapper::toDto)
                        .collect(Collectors.toSet()));
        
        dto.setTagInstanceIds(
                entity.getTagInstances()
                        .stream()
                        .map(e -> e.getId())
                        .collect(Collectors.toSet()));

	dto.setCollectionInstances(
		entity.getCollectionInstances()
			.stream()
			.map(this.frontendCollectionInstanceMapper::toDto)
			.collect(Collectors.toSet()));

        return dto;
    }
}
