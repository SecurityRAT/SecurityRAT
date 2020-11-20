package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = {
            ReqCategoryMapper.class,
            TagInstanceMapper.class,
            CollectionInstanceMapper.class,
            ProjectTypeMapper.class
        })
public interface RequirementSkeletonMapper
        extends IdentifiableMapper<Long, RequirementSkeleton, RequirementSkeletonDto> {
}
