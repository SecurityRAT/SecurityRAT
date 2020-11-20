package org.appsec.securityrat.api.endpoint.training;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingGeneratedSlideNodeDto;
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
public class TrainingGeneratedSlideNodeResource {
    private static final String ENTITY_NAME = "trainingGeneratedSlideNode";
    
    @Inject
    private TrainingNodeProvider provider;
    
    @PostMapping("/trainingGeneratedSlideNodes")
    public ResponseEntity<TrainingGeneratedSlideNodeDto> create(
            @RequestBody TrainingGeneratedSlideNodeDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.createGeneratedSlideNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TrainingGeneratedSlideNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/trainingGeneratedSlideNodes")
    public ResponseEntity<TrainingGeneratedSlideNodeDto> update(
            @RequestBody TrainingGeneratedSlideNodeDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.updateGeneratedSlideNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TrainingGeneratedSlideNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/trainingGeneratedSlideNodes")
    public ResponseEntity<Set<TrainingGeneratedSlideNodeDto>> getAll() {
        Set<TrainingGeneratedSlideNodeDto> result =
                this.provider.findAllGeneratedSlideNodes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingGeneratedSlideNodes/{id}")
    public ResponseEntity<TrainingGeneratedSlideNodeDto> get(
            @PathVariable Long id) {
        TrainingGeneratedSlideNodeDto result =
                this.provider.findGeneratedSlideNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingGeneratedSlideNodeByTrainingTreeNode/{id}")
    public ResponseEntity<TrainingGeneratedSlideNodeDto> getByTrainingTreeNode(
            @PathVariable Long id) {
        TrainingGeneratedSlideNodeDto result =
                this.provider.findGeneratedSlideNodeByTreeNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/trainingGeneratedSlideNodes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.provider.deleteGeneratedSlideNode(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TrainingGeneratedSlideNodeResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/trainingGeneratedSlideNodes/{query}")
    public ResponseEntity<List<TrainingGeneratedSlideNodeDto>> search(
            String query) {
        List<TrainingGeneratedSlideNodeDto> result =
                this.provider.searchGeneratedSlideNodes(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
