package org.appsec.securityrat.provider.advanced;

import com.google.common.base.Preconditions;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.StatusColumnValueDto;
import org.appsec.securityrat.api.provider.advanced.StatusColumnValueProvider;
import org.appsec.securityrat.domain.StatusColumnValue;
import org.appsec.securityrat.provider.mapper.StatusColumnValueMapper;
import org.appsec.securityrat.repository.StatusColumnRepository;
import org.appsec.securityrat.repository.StatusColumnValueRepository;
import org.appsec.securityrat.repository.search.StatusColumnValueSearchRepository;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatusColumnValueProviderImpl
        implements StatusColumnValueProvider {
    
    @Inject
    private StatusColumnValueRepository repo;
    
    @Inject
    private StatusColumnValueSearchRepository searchRepo;
    
    @Inject
    private StatusColumnRepository statusColumnRepo;
    
    @Inject
    private StatusColumnValueMapper mapper;

    @Override
    @Transactional
    public Set<StatusColumnValueDto> findByStatusColumn(Long statusColumnId) {
        Preconditions.checkNotNull(statusColumnId);
        
        return this.statusColumnRepo.findById(statusColumnId)
                .map(e -> e.getStatusColumnValues()
                        .stream()
                        .map(this.mapper::toDto)
                        .collect(Collectors.toSet()))
                .orElse(null);
    }

    @Override
    @Transactional
    public boolean create(StatusColumnValueDto dto) {
        Preconditions.checkNotNull(dto);
        
        StatusColumnValue entity = this.mapper.toEntity(dto);
        
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
    public boolean update(StatusColumnValueDto dto) {
        Preconditions.checkNotNull(dto);
        
        StatusColumnValue entity = this.mapper.toEntity(dto);
        
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
        
        StatusColumnValue entity = this.repo.findById(id).orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.repo.delete(entity);
        this.searchRepo.delete(entity);
        
        return true;
    }

    @Override
    @Transactional
    public StatusColumnValueDto find(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.repo.findById(id)
                .map(this.mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public Set<StatusColumnValueDto> findAll() {
        return this.repo.findAll()
                .stream()
                .map(this.mapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public List<StatusColumnValueDto> search(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.searchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.mapper::toDto)
                .collect(Collectors.toList());
    }
}
