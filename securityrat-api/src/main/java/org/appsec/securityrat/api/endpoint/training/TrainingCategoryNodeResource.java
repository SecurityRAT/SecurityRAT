package org.appsec.securityrat.api.endpoint.training;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingCategoryNodeDto;
import org.appsec.securityrat.api.endpoint.rest.SimpleResource;
import org.appsec.securityrat.api.provider.TrainingNodeProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TrainingCategoryNodeResource {
    private static final String ENTITY_NAME = "trainingCategoryNode";
    
    @Inject
    private TrainingNodeProvider provider;
    
    @PostMapping("/trainingCategoryNodes")
    public ResponseEntity<TrainingCategoryNodeDto> create(
            @RequestBody TrainingCategoryNodeDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.createCategoryNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TrainingCategoryNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/trainingCategoryNodes")
    public ResponseEntity<TrainingCategoryNodeDto> update(
            @RequestBody TrainingCategoryNodeDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.updateCategoryNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TrainingCategoryNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/trainingCategoryNodes")
    public ResponseEntity<Set<TrainingCategoryNodeDto>> getAll() {
        Set<TrainingCategoryNodeDto> result =
                this.provider.findAllCategoryNodes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingCategoryNodes/{id}")
    public ResponseEntity<TrainingCategoryNodeDto> get(@PathVariable Long id) {
        TrainingCategoryNodeDto result = this.provider.findCategoryNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingCategoryNodeByTrainingTreeNode/{id}")
    public ResponseEntity<TrainingCategoryNodeDto> getByTrainingTreeNode(
            @PathVariable Long id) {
        TrainingCategoryNodeDto result =
                this.provider.findCategoryNodeByTreeNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/trainingCategoryNodes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.provider.deleteCategoryNode(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TrainingCategoryNodeResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/trainingCategoryNodes/{query}")
    public ResponseEntity<List<TrainingCategoryNodeDto>> search(String query) {
        List<TrainingCategoryNodeDto> result =
                this.provider.searchCategoryNodes(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
