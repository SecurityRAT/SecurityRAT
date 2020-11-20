package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.OptColumnContentDto;
import org.appsec.securityrat.api.provider.advanced.OptColumnContentProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class OptColumnContentResource {
    private static final String ENTITY_NAME = "optColumnContent";
    
    @Inject
    private OptColumnContentProvider provider;
    
    @PostMapping("/optColumnContents")
    public ResponseEntity<OptColumnContentDto> create(
            @RequestBody OptColumnContentDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.create(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        OptColumnContentResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/optColumnContents")
    public ResponseEntity<OptColumnContentDto> update(
            @RequestBody OptColumnContentDto dto) {
        if  (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.update(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        OptColumnContentResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/optColumnContents")
    public ResponseEntity<Set<OptColumnContentDto>> getAll() {
        Set<OptColumnContentDto> result = this.provider.findAll();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/optColumnContents/{id}")
    public ResponseEntity<OptColumnContentDto> get(@PathVariable Long id) {
        OptColumnContentDto dto = this.provider.find(id);
        
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/optColumnContents/getRequirement/{id}")
    public ResponseEntity<Set<OptColumnContentDto>> getByRequirementSkeleton(
            @PathVariable Long id) {
        Set<OptColumnContentDto> result =
                this.provider.findByRequirementSkeleton(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/optColumnContents/filter")
    public ResponseEntity<Set<OptColumnContentDto>> getByProjectTypeAndRequirementSkeleton(
            @RequestParam("projectTypeId") Long projectTypeId,
            @RequestParam("requirementId") Long requirementSkeletonId) {
        Set<OptColumnContentDto> result =
                this.provider.findByRequirementSkeletonAndProjectType(
                        requirementSkeletonId,
                        projectTypeId);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    public ResponseEntity<OptColumnContentDto> getByOptColumnAndRequirementSkeleton(
            @PathVariable("optColumnId") Long optColumnId,
            @PathVariable("requirementId") Long requirementId) {
        OptColumnContentDto result =
                this.provider.findByOptColumnAndRequirementSkeleton(
                        optColumnId,
                        requirementId);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/optColumnContents/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.delete(id)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        OptColumnContentResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/optColumnContents/{query}")
    public ResponseEntity<List<OptColumnContentDto>> search(
            @PathVariable String query) {
        List<OptColumnContentDto> result = this.provider.search(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
