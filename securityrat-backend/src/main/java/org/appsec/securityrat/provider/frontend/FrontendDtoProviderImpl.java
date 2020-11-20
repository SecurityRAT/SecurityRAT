package org.appsec.securityrat.provider.frontend;

import com.google.common.base.Preconditions;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.inject.Inject;
import org.appsec.securityrat.domain.AlternativeSet;
import org.appsec.securityrat.domain.CollectionInstance;
import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.provider.mapper.frontend.FrontendAlternativeInstanceMapper;
import org.appsec.securityrat.provider.mapper.frontend.FrontendCategoryMapper;
import org.appsec.securityrat.provider.mapper.frontend.FrontendCollectionCategoryMapper;
import org.appsec.securityrat.provider.mapper.frontend.FrontendOptionColumnAlternativeMapper;
import org.appsec.securityrat.provider.mapper.frontend.FrontendProjectTypeMapper;
import org.appsec.securityrat.provider.mapper.frontend.FrontendTagCategoryMapper;
import org.appsec.securityrat.repository.AlternativeInstanceRepository;
import org.appsec.securityrat.repository.AlternativeSetRepository;
import org.appsec.securityrat.repository.CollectionCategoryRepository;
import org.appsec.securityrat.repository.CollectionInstanceRepository;
import org.appsec.securityrat.repository.OptColumnRepository;
import org.appsec.securityrat.repository.ProjectTypeRepository;
import org.appsec.securityrat.repository.ReqCategoryRepository;
import org.appsec.securityrat.repository.TagCategoryRepository;
import org.appsec.securityrat.web.dto.FrontendAlternativeInstanceDto;
import org.appsec.securityrat.web.dto.FrontendCategoryDto;
import org.appsec.securityrat.web.dto.FrontendCollectionCategoryDto;
import org.appsec.securityrat.web.dto.FrontendOptionColumnAlternativeDto;
import org.appsec.securityrat.web.dto.FrontendProjectTypeDto;
import org.appsec.securityrat.web.dto.FrontendTagCategoryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FrontendDtoProviderImpl implements FrontendDtoProvider {
    @Inject
    private CollectionCategoryRepository collectionCategoryRepo;
    
    @Inject
    private ProjectTypeRepository projectTypeRepo;
    
    @Inject
    private TagCategoryRepository tagCategoryRepo;
    
    @Inject
    private CollectionInstanceRepository collectionInstanceRepo;
    
    @Inject
    private ReqCategoryRepository reqCategoryRepo;
    
    @Inject
    private OptColumnRepository optColumnRepo;
    
    @Inject
    private AlternativeInstanceRepository alternativeInstanceRepo;
    
    @Inject
    private AlternativeSetRepository alternativeSetRepo;
    
    @Inject
    private FrontendCollectionCategoryMapper collectionCategoryMapper;
    
    @Inject
    private FrontendProjectTypeMapper projectTypeMapper;
    
    @Inject
    private FrontendTagCategoryMapper tagCategoryMapper;
    
    @Inject
    private FrontendCategoryMapper categoryMapper;
    
    @Inject
    private FrontendOptionColumnAlternativeMapper optionColumnAlternativeMapper;
    
    @Inject
    private FrontendAlternativeInstanceMapper alternativeInstanceMapper;
    
    @Override
    @Transactional
    public Set<FrontendCollectionCategoryDto> getActiveFrontendCollectionCategories() {
        return this.collectionCategoryRepo.findAllActiveWithEagerActiveRelationships()
                .stream()
                .map(this.collectionCategoryMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public Set<FrontendProjectTypeDto> getActiveProjectTypes() {
        return this.projectTypeRepo.findAllActiveWithEagerActiveRelationships()
                .stream()
                .map(this.projectTypeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public Set<FrontendTagCategoryDto> getActiveTagCategories() {
        return this.tagCategoryRepo.findAllActiveWithEagerActiveRelationships()
                .stream()
                .map(this.tagCategoryMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public Set<FrontendOptionColumnAlternativeDto> getActiveOptionColumnAlternatives() {
        return this.optColumnRepo.getActiveOptColumnsWithActiveAlternativeSets()
                .stream()
                .map(this.optionColumnAlternativeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public Set<FrontendCategoryDto> getCategoriesByCollectionInstancesAndProjectTypes(
            Long[] collectionInstanceIds,
            Long[] projectTypeIds) {
        Preconditions.checkNotNull(collectionInstanceIds);
        Preconditions.checkNotNull(projectTypeIds);
        
        // Resolution of the parameters
        
        Arrays.sort(collectionInstanceIds);
        Arrays.sort(projectTypeIds);
        
        List<CollectionInstance> collectionInstances =
                this.collectionInstanceRepo.findAll()
                        .stream()
                        .filter(e -> Arrays.binarySearch(
                                collectionInstanceIds,
                                e.getId()) >= 0)
                        .collect(Collectors.toList());
        
        List<ProjectType> projectTypes =
                this.projectTypeRepo.findAll()
                        .stream()
                        .filter(e -> Arrays.binarySearch(
                                projectTypeIds,
                                e.getId()) >= 0)
                        .collect(Collectors.toList());
        
        return this.reqCategoryRepo.findEagerlyCategoriesWithRequirements(
                    collectionInstances,
                    projectTypes)
                .stream()
                .map(this.categoryMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public Set<FrontendAlternativeInstanceDto> getAlternativeInstancesByAlternativetSet(
            Long alternativeSetId) {
        Preconditions.checkNotNull(alternativeSetId);
        
        // Resolution of the parameters
        
        AlternativeSet alternativeSet =
                this.alternativeSetRepo.findById(alternativeSetId)
                        .orElse(null);
        
        if (alternativeSet == null) {
            return null;
        }
        
        return this.alternativeInstanceRepo.getActiveAlternativeInstancesForAlternativeSet(
                    alternativeSet)
                .stream()
                .map(this.alternativeInstanceMapper::toDto)
                .collect(Collectors.toSet());
    }
}
