package org.appsec.securityrat.provider.advanced;

import com.google.common.base.Preconditions;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;
import org.appsec.securityrat.api.provider.advanced.RequirementSkeletonProvider;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.appsec.securityrat.provider.mapper.RequirementSkeletonMapper;
import org.appsec.securityrat.repository.RequirementSkeletonRepository;
import org.appsec.securityrat.repository.search.RequirementSkeletonSearchRepository;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RequirementSkeletonProviderImpl
        implements RequirementSkeletonProvider {
    
    @Inject
    private RequirementSkeletonRepository repo;
    
    @Inject
    private RequirementSkeletonSearchRepository searchRepo;
    
    @Inject
    private RequirementSkeletonMapper mapper;

    @Override
    @Transactional
    public Set<RequirementSkeletonDto> getIntersection(
            Long[] collectionInstanceIds,
            Long[] projectTypeIds) {
        Preconditions.checkNotNull(collectionInstanceIds);
        Preconditions.checkNotNull(projectTypeIds);
        
        Arrays.sort(collectionInstanceIds);
        Arrays.sort(projectTypeIds);
        
        return this.repo.findAll()
                .stream()
                .filter(e -> e.getCollectionInstances()
                        .stream()
                        .anyMatch(f -> Arrays.binarySearch(
                                collectionInstanceIds,
                                f.getId()) > 0))
                .filter(e -> e.getProjectTypes()
                        .stream()
                        .anyMatch(f -> Arrays.binarySearch(
                                projectTypeIds,
                                f.getId()) > 0))
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public Set<RequirementSkeletonDto> findByShortName(String shortName) {
        Preconditions.checkNotNull(shortName);
        
        return this.repo.findByShortName(shortName)
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public boolean create(RequirementSkeletonDto dto) {
        Preconditions.checkNotNull(dto);
        
        RequirementSkeleton entity = this.mapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        this.repo.save(entity);
        this.searchRepo.save(entity);
        
        dto.setId(entity.getId());
        
        return true;
    }

    @Override
    @Transactional
    public boolean update(RequirementSkeletonDto dto) {
        Preconditions.checkNotNull(dto);
        
        RequirementSkeleton entity = this.mapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        this.repo.save(entity);
        this.searchRepo.save(entity);
        
        return true;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        Preconditions.checkNotNull(id);
        
        RequirementSkeleton entity = this.repo.findById(id).orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.repo.delete(entity);
        this.searchRepo.delete(entity);
        
        return true;
    }

    @Override
    @Transactional
    public RequirementSkeletonDto find(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.repo.findById(id)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public Set<RequirementSkeletonDto> findAll() {
        return this.repo.findAllWithEagerRelationships()
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public List<RequirementSkeletonDto> search(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.searchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.mapper::toDto)
                .collect(Collectors.toList());
    }
}
