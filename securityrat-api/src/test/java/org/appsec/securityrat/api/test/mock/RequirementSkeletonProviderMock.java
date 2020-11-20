package org.appsec.securityrat.api.test.mock;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;
import org.appsec.securityrat.api.provider.advanced.RequirementSkeletonProvider;
import org.springframework.stereotype.Service;

@Service
public class RequirementSkeletonProviderMock
        implements RequirementSkeletonProvider {
    
    @Override
    public Set<RequirementSkeletonDto> getIntersection(
            Long[] collectionInstanceIds,
            Long[] projectTypeIds) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<RequirementSkeletonDto> findByShortName(String shortName) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean create(RequirementSkeletonDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean update(RequirementSkeletonDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean delete(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public RequirementSkeletonDto find(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<RequirementSkeletonDto> findAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<RequirementSkeletonDto> search(String query) {
        throw new UnsupportedOperationException();
    }
}
