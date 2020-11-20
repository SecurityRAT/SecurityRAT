package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.CollectionCategory;
import org.appsec.securityrat.web.dto.FrontendCollectionCategoryDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = { FrontendCollectionInstanceMapper.class })
public interface FrontendCollectionCategoryMapper
        extends FrontendMapper<CollectionCategory, FrontendCollectionCategoryDto> {
}
