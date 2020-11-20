package org.appsec.securityrat.provider.mapper;

import org.appsec.securityrat.api.dto.rest.CollectionInstanceDto;
import org.appsec.securityrat.domain.CollectionInstance;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { CollectionCategoryMapper.class })
public interface CollectionInstanceMapper
        extends IdentifiableMapper<Long, CollectionInstance, CollectionInstanceDto> {
}
