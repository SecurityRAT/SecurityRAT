package org.appsec.securityrat.api.endpoint.training;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingRequirementNodeDto;
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
public class TrainingRequirementNodeResource {
    private static final String ENTITY_NAME = "trainingRequirementNode";
    
    @Inject
    private TrainingNodeProvider provider;
    
    @PostMapping("/trainingRequirementNodes")
    public ResponseEntity<TrainingRequirementNodeDto> create(
            @RequestBody TrainingRequirementNodeDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.createRequirementNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TrainingRequirementNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/trainingRequirementNodes")
    public ResponseEntity<TrainingRequirementNodeDto> update(
            @RequestBody TrainingRequirementNodeDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.updateRequirementNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TrainingRequirementNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/trainingRequirementNodes")
    public ResponseEntity<Set<TrainingRequirementNodeDto>> getAll() {
        Set<TrainingRequirementNodeDto> result =
                this.provider.findAllRequirementNodes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingRequirementNodes/{id}")
    public ResponseEntity<TrainingRequirementNodeDto> get(
            @PathVariable Long id) {
        TrainingRequirementNodeDto result =
                this.provider.findRequirementNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingRequirementNodeByTrainingTreeNode/{id}")
    public ResponseEntity<TrainingRequirementNodeDto> getByTrainingTreeNode(
            @PathVariable Long id) {
        TrainingRequirementNodeDto result =
                this.provider.findRequirementNodeByTreeNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/trainingRequirementNodes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.provider.deleteRequirementNode(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TrainingRequirementNodeResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/trainingRequirementNodes/{query}")
    public ResponseEntity<List<TrainingRequirementNodeDto>> search(
            String query) {
        List<TrainingRequirementNodeDto> result =
                this.provider.searchRequirementNodes(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
