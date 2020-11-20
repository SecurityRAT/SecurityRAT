package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.rest.RequirementSkeletonDto;
import org.appsec.securityrat.api.provider.advanced.RequirementSkeletonProvider;
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
public class RequirementSkeletonResource {
    private static final String ENTITY_NAME = "requirementSkeleton";
    
    @Inject
    private RequirementSkeletonProvider provider;
    
    @PostMapping("/requirementSkeletons")
    public ResponseEntity<RequirementSkeletonDto> create(
            @RequestBody RequirementSkeletonDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.create(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        RequirementSkeletonResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/requirementSkeletons")
    public ResponseEntity<RequirementSkeletonDto> update(
            @RequestBody RequirementSkeletonDto dto) {
        if  (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.update(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        RequirementSkeletonResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/requirementSkeletons")
    public ResponseEntity<Set<RequirementSkeletonDto>> getAll() {
        Set<RequirementSkeletonDto> result = this.provider.findAll();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/requirementSkeletons/{id}")
    public ResponseEntity<RequirementSkeletonDto> get(@PathVariable Long id) {
        RequirementSkeletonDto dto = this.provider.find(id);
        
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/requirementSkeletons/getSelected")
    public ResponseEntity<Set<RequirementSkeletonDto>> get(
            @RequestParam("collections") Long[] collections,
            @RequestParam("projecttypes") Long[] projectTypes) {
        Set<RequirementSkeletonDto> dtos =
                this.provider.getIntersection(collections, projectTypes);
        
        if (dtos == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(dtos);
    }
    
    @DeleteMapping("/requirementSkeletons/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.delete(id)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        RequirementSkeletonResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/requirementSkeletons/{query}")
    public ResponseEntity<List<RequirementSkeletonDto>> search(
            @PathVariable String query) {
        List<RequirementSkeletonDto> result = this.provider.search(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/requirementSkeletons/foo/{shortName}")
    public ResponseEntity<Set<RequirementSkeletonDto>> foo(
            @PathVariable String shortName) {
        Set<RequirementSkeletonDto> result =
                this.provider.findByShortName(shortName);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
