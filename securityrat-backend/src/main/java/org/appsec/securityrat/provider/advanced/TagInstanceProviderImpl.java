package org.appsec.securityrat.provider.advanced;

import com.google.common.base.Preconditions;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.TagInstanceDto;
import org.appsec.securityrat.api.provider.advanced.TagInstanceProvider;
import org.appsec.securityrat.domain.TagCategory;
import org.appsec.securityrat.domain.TagInstance;
import org.appsec.securityrat.provider.mapper.TagInstanceMapper;
import org.appsec.securityrat.repository.TagCategoryRepository;
import org.appsec.securityrat.repository.TagInstanceRepository;
import org.appsec.securityrat.repository.search.TagInstanceSearchRepository;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TagInstanceProviderImpl implements TagInstanceProvider {
    @Inject
    private TagInstanceRepository repo;
    
    @Inject
    private TagInstanceSearchRepository searchRepo;
    
    @Inject
    private TagCategoryRepository tagCategoryRepo;
    
    @Inject
    private TagInstanceMapper mapper;
    
    @Override
    @Transactional
    public Set<TagInstanceDto> findByCategoryId(Long tagCategoryId) {
        Preconditions.checkNotNull(tagCategoryId);
        
        TagCategory category = this.tagCategoryRepo.findById(tagCategoryId)
                .orElse(null);
        
        if (category == null) {
            return null;
        }
        
        return category.getTagInstances()
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public boolean create(TagInstanceDto dto) {
        Preconditions.checkNotNull(dto);
        
        // It is required that the entity's id is not specified.
        
        TagInstance entity = this.mapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        // Storing the entity
        
        this.repo.save(entity);
        this.searchRepo.save(entity);
        
        // Copying the assigned identifier to the dto
        
        dto.setId(entity.getId());
        
        return true;
    }

    @Override
    @Transactional
    public boolean update(TagInstanceDto dto) {
        Preconditions.checkNotNull(dto);
        
        // It is required that the entity's id is specified.
        
        TagInstance entity = this.mapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        // Updating the entity
        
        this.repo.save(entity);
        this.searchRepo.save(entity);
        
        return true;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        Preconditions.checkNotNull(id);
        
        TagInstance entity = this.repo.findById(id).orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.repo.delete(entity);
        this.searchRepo.delete(entity);
        
        return true;
    }

    @Override
    @Transactional
    public TagInstanceDto find(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.repo.findById(id)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public Set<TagInstanceDto> findAll() {
        return this.repo.findAll()
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public List<TagInstanceDto> search(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.searchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.mapper::toDto)
                .collect(Collectors.toList());
    }
}
