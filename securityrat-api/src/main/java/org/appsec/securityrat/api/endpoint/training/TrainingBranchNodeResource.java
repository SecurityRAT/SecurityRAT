package org.appsec.securityrat.api.endpoint.training;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingBranchNodeDto;
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
public class TrainingBranchNodeResource {
    private static final String ENTITY_NAME = "trainingBranchNode";
    
    @Inject
    private TrainingNodeProvider provider;
    
    @PostMapping("/trainingBranchNodes")
    public ResponseEntity<TrainingBranchNodeDto> create(
            @RequestBody TrainingBranchNodeDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.createBranchNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TrainingBranchNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/trainingBranchNodes")
    public ResponseEntity<TrainingBranchNodeDto> update(
            @RequestBody TrainingBranchNodeDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.updateBranchNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TrainingBranchNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/trainingBranchNodes")
    public ResponseEntity<Set<TrainingBranchNodeDto>> getAll() {
        Set<TrainingBranchNodeDto> result = this.provider.findAllBranchNodes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingBranchNodes/{id}")
    public ResponseEntity<TrainingBranchNodeDto> get(@PathVariable Long id) {
        TrainingBranchNodeDto result = this.provider.findBranchNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingBranchNodeByTrainingTreeNode/{id}")
    public ResponseEntity<TrainingBranchNodeDto> getByTrainingTreeNode(
            @PathVariable Long id) {
        TrainingBranchNodeDto result =
                this.provider.findBranchNodeByTreeNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/trainingBranchNodes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.provider.deleteBranchNode(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TrainingBranchNodeResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/trainingBranchNodes/{query}")
    public ResponseEntity<List<TrainingBranchNodeDto>> search(String query) {
        List<TrainingBranchNodeDto> result =
                this.provider.searchBranchNodes(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
