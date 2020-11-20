package org.appsec.securityrat.provider.advanced;

import com.google.common.base.Preconditions;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.OptColumnContentDto;
import org.appsec.securityrat.api.provider.advanced.OptColumnContentProvider;
import org.appsec.securityrat.domain.OptColumn;
import org.appsec.securityrat.domain.OptColumnContent;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.appsec.securityrat.provider.mapper.OptColumnContentMapper;
import org.appsec.securityrat.repository.OptColumnContentRepository;
import org.appsec.securityrat.repository.OptColumnRepository;
import org.appsec.securityrat.repository.RequirementSkeletonRepository;
import org.appsec.securityrat.repository.search.OptColumnContentSearchRepository;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OptColumnContentProviderImpl implements OptColumnContentProvider {
    @Inject
    private OptColumnContentRepository repo;
    
    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepo;
    
    @Inject
    private OptColumnRepository optColumnRepo;
    
    @Inject
    private OptColumnContentSearchRepository searchRepo;
    
    @Inject
    private OptColumnContentMapper mapper;
    
    @Override
    @Transactional
    public Set<OptColumnContentDto> findByRequirementSkeleton(
            Long requirementSkeletonId) {
        Preconditions.checkNotNull(requirementSkeletonId);
        
        return this.requirementSkeletonRepo.findById(requirementSkeletonId)
                .map(e -> e.getOptColumnContents()
                        .stream()
                        .map(this.mapper::toDto)
                        .collect(Collectors.toSet()))
                .orElse(null);
    }

    @Override
    @Transactional
    public Set<OptColumnContentDto> findByRequirementSkeletonAndProjectType(
            Long requirementSkeletonId,
            Long projectTypeId) {
        Preconditions.checkNotNull(requirementSkeletonId);
        Preconditions.checkNotNull(projectTypeId);
        
        return this.repo.findOptColumnsForRequirementIdAndProjectTypeId(
                    requirementSkeletonId,
                    projectTypeId)
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public OptColumnContentDto findByOptColumnAndRequirementSkeleton(
            Long optColumnId,
            Long requirementSkeletonId) {
        Preconditions.checkNotNull(optColumnId);
        Preconditions.checkNotNull(requirementSkeletonId);
        
        OptColumn optColumn = this.optColumnRepo.findById(optColumnId)
                .orElse(null);
        
        if (optColumn == null) {
            return null;
        }
        
        RequirementSkeleton requirementSkeleton =
                this.requirementSkeletonRepo.findById(requirementSkeletonId)
                        .orElse(null);
        
        if (requirementSkeleton == null) {
            return null;
        }
        
        List<OptColumnContent> result =
                this.repo.getOptColumnContentByOptColumnAndRequirement(
                        requirementSkeleton,
                        optColumn);
        
        if (result == null || result.isEmpty()) {
            return null;
        }
        
        return this.mapper.toDto(result.get(0));
    }

    @Override
    @Transactional
    public boolean create(OptColumnContentDto dto) {
        Preconditions.checkNotNull(dto);
        
        OptColumnContent entity = this.mapper.toEntity(dto);
        
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
    public boolean update(OptColumnContentDto dto) {
        Preconditions.checkNotNull(dto);
        
        OptColumnContent entity = this.mapper.toEntity(dto);
        
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
        
        OptColumnContent entity = this.repo.findById(id).orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.repo.delete(entity);
        this.searchRepo.delete(entity);
        
        return true;
    }

    @Override
    @Transactional
    public OptColumnContentDto find(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.repo.findById(id)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public Set<OptColumnContentDto> findAll() {
        return this.repo.findAll()
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public List<OptColumnContentDto> search(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.searchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.mapper::toDto)
                .collect(Collectors.toList());
    }
}
