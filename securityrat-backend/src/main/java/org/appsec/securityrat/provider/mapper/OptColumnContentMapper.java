package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.OptColumnContentDto;
import org.appsec.securityrat.domain.OptColumnContent;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { OptColumnMapper.class, RequirementSkeletonMapper.class })
public interface OptColumnContentMapper
        extends IdentifiableMapper<Long, OptColumnContent, OptColumnContentDto> {
}
