package org.appsec.securityrat.provider.mapper.frontend;

import org.appsec.securityrat.domain.CollectionInstance;
import org.appsec.securityrat.web.dto.FrontendCollectionInstanceDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FrontendCollectionInstanceMapper
        extends FrontendMapper<CollectionInstance, FrontendCollectionInstanceDto> {
}
