package org.appsec.securityrat.api.test.mock;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.OptColumnContentDto;
import org.appsec.securityrat.api.provider.advanced.OptColumnContentProvider;
import org.springframework.stereotype.Service;

@Service
public class OptColumnContentProviderMock implements OptColumnContentProvider {
    @Override
    public Set<OptColumnContentDto> findByRequirementSkeleton(
            Long requirementSkeletonId) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<OptColumnContentDto> findByRequirementSkeletonAndProjectType(
            Long requirementSkeletonId,
            Long projectTypeId) {
        throw new UnsupportedOperationException();
    }

    @Override
    public OptColumnContentDto findByOptColumnAndRequirementSkeleton(
            Long optColumnId,
            Long requirementSkeletonId) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean create(OptColumnContentDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean update(OptColumnContentDto dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean delete(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public OptColumnContentDto find(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<OptColumnContentDto> findAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<OptColumnContentDto> search(String query) {
        throw new UnsupportedOperationException();
    }
}
