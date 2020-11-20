package org.appsec.securityrat.web.endpoint;

import java.util.Set;
import java.util.stream.Collectors;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.AlternativeInstanceDto;
import org.appsec.securityrat.api.dto.rest.OptColumnContentDto;
import org.appsec.securityrat.api.dto.rest.ReqCategoryDto;
import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;
import org.appsec.securityrat.api.provider.PersistentStorage;
import org.appsec.securityrat.api.provider.advanced.OptColumnContentProvider;
import org.appsec.securityrat.api.provider.advanced.RequirementSkeletonProvider;
import org.appsec.securityrat.provider.frontend.FrontendDtoProvider;
import org.appsec.securityrat.provider.frontend.ImporterProvider;
import org.appsec.securityrat.web.dto.FrontendAlternativeInstanceDto;
import org.appsec.securityrat.web.dto.FrontendCategoryDto;
import org.appsec.securityrat.web.dto.FrontendCollectionCategoryDto;
import org.appsec.securityrat.web.dto.FrontendOptionColumnAlternativeDto;
import org.appsec.securityrat.web.dto.FrontendProjectTypeDto;
import org.appsec.securityrat.web.dto.FrontendTagCategoryDto;
import org.appsec.securityrat.web.dto.importer.FrontendObjectDto;
import org.appsec.securityrat.web.dto.importer.FrontendTypeDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/frontend-api")
public class FrontendUniversalResource {
    @Inject
    private FrontendDtoProvider frontendProvider;
    
    @Inject
    private PersistentStorage persistentStorage;
    
    @Inject
    private RequirementSkeletonProvider requirementSkeletonProvider;
    
    @Inject
    private OptColumnContentProvider optColumnContentProvider;
    
    @Inject
    private ImporterProvider importerProvider;
    
    @GetMapping("/collections")
    public ResponseEntity<Set<FrontendCollectionCategoryDto>> getActiveCollectonCategories() {
        Set<FrontendCollectionCategoryDto> result =
                this.frontendProvider.getActiveFrontendCollectionCategories();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/projectTypes")
    public ResponseEntity<Set<FrontendProjectTypeDto>> getActiveProjectTypes() {
        Set<FrontendProjectTypeDto> result =
                this.frontendProvider.getActiveProjectTypes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/tags")
    public ResponseEntity<Set<FrontendTagCategoryDto>> getActiveTagCategories() {
        Set<FrontendTagCategoryDto> result =
                this.frontendProvider.getActiveTagCategories();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/requirementCategories")
    public ResponseEntity<Set<ReqCategoryDto>> getActiveReqCategories() {
        Set<ReqCategoryDto> dtos =
                this.persistentStorage.findAll(ReqCategoryDto.class);
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(
                dtos.stream()
                        .filter(d -> d.getActive())
                        .collect(Collectors.toSet()));
    }
    
    @GetMapping("/requirementSkeletons")
    public ResponseEntity<Set<RequirementSkeletonDto>> getActiveRequirementSkeletons() {
        Set<RequirementSkeletonDto> dtos =
                this.requirementSkeletonProvider.findAll();
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(
                dtos.stream()
                        .filter(d -> d.getActive())
                        .collect(Collectors.toSet()));
    }
    
    @GetMapping("/requirementSkeletons/{id}")
    public ResponseEntity<RequirementSkeletonDto> getActiveRequirementSkeleton(
            @PathVariable Long id) {
        RequirementSkeletonDto dto = this.requirementSkeletonProvider.find(id);
        
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/alternativeinstances")
    public ResponseEntity<Set<AlternativeInstanceDto>> getActiveAlternativeInstances() {
        Set<AlternativeInstanceDto> dtos =
                this.persistentStorage.findAll(AlternativeInstanceDto.class);
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(
                dtos.stream()
                        .filter(d -> d.getAlternativeSet().getActive())
                        .collect(Collectors.toSet()));
    }
    
    @GetMapping("/optColumnContents")
    public ResponseEntity<Set<OptColumnContentDto>> getActiveOptColumnContents() {
        Set<OptColumnContentDto> dtos = this.optColumnContentProvider.findAll();
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(
                dtos.stream()
                        .filter(d -> d.getOptColumn().getActive())
                        .collect(Collectors.toSet()));
    }
    
    @GetMapping("/optionColumnsWithAlternativeSets")
    public ResponseEntity<Set<FrontendOptionColumnAlternativeDto>> getActiveOptionColumnAlternatives() {
        Set<FrontendOptionColumnAlternativeDto> dtos =
                this.frontendProvider.getActiveOptionColumnAlternatives();
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/categoriesWithRequirements/filter")
    public ResponseEntity<Set<FrontendCategoryDto>> getCategoriesByCollectionInstancesAndProjectTypes(
            @RequestParam("collections") Long[] collectionIds,
            @RequestParam("projectTypes") Long[] projectTypeIds) {
        Set<FrontendCategoryDto> dtos =
                this.frontendProvider.getCategoriesByCollectionInstancesAndProjectTypes(
                        collectionIds,
                        projectTypeIds);
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/numberOfRequirements/filter")
    public ResponseEntity<Integer> getNumberOfRequirements(
            @RequestParam("collections") Long[] collectionIds,
            @RequestParam("projectTypes") Long[] projectTypeIds) {
        Set<FrontendCategoryDto> dtos =
                this.frontendProvider.getCategoriesByCollectionInstancesAndProjectTypes(
                        collectionIds,
                        projectTypeIds);
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(
                dtos.stream()
                        .mapToInt(d -> d.getRequirements().size())
                        .sum());
    }
    
    @GetMapping("/alternativeInstances/filter")
    public ResponseEntity<Set<FrontendAlternativeInstanceDto>> getAlternativeInstancesForAlternativeSet(
            @RequestParam("alternativeSet") Long alternativeSetId) {
        Set<FrontendAlternativeInstanceDto> dtos =
                this.frontendProvider.getAlternativeInstancesByAlternativetSet(
                        alternativeSetId);
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(dtos);
    }
    
    // ============================= IMPORTER API ==============================
    
    @GetMapping("/importer/types")
    public ResponseEntity<Set<FrontendTypeDto>> getAssistantAvailableTypes() {
        Set<FrontendTypeDto> result = this.importerProvider.getAvailableTypes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/importer/apply")
    public ResponseEntity<Void> applyAssistantObjects(
            @RequestBody Set<FrontendObjectDto> dtos) {
        if (!this.importerProvider.applyObjects(dtos)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    @GetMapping("/importer/instances/{typeIdentifier}")
    public ResponseEntity<Set<FrontendObjectDto>> getAssistantExistingInstances(
            @PathVariable String typeIdentifier) {
        Set<FrontendObjectDto> result =
                this.importerProvider.getExistingInstances(typeIdentifier);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return ResponseEntity.ok(result);
    }
}
