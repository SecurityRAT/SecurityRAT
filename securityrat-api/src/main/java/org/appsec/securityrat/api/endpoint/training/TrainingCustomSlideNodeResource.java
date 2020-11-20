package org.appsec.securityrat.api.endpoint.training;

import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingCustomSlideNodeDto;
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
public class TrainingCustomSlideNodeResource {
    private static final String ENTITY_NAME = "trainingCustomSlideNode";
    
    @Inject
    private TrainingNodeProvider provider;
    
    @PostMapping("/trainingCustomSlideNodes")
    public ResponseEntity<TrainingCustomSlideNodeDto> create(
            @RequestBody TrainingCustomSlideNodeDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.createCustomSlideNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TrainingCustomSlideNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/trainingCustomSlideNodes")
    public ResponseEntity<TrainingCustomSlideNodeDto> update(
            @RequestBody TrainingCustomSlideNodeDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.updateCustomSlideNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TrainingCustomSlideNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/trainingCustomSlideNodes")
    public ResponseEntity<Set<TrainingCustomSlideNodeDto>> getAll() {
        Set<TrainingCustomSlideNodeDto> result =
                this.provider.findAllCustomSlideNodes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingCustomSlideNodes/{id}")
    public ResponseEntity<TrainingCustomSlideNodeDto> get(
            @PathVariable Long id) {
        TrainingCustomSlideNodeDto result =
                this.provider.findCustomSlideNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingCustomSlideNodeByTrainingTreeNode/{id}")
    public ResponseEntity<TrainingCustomSlideNodeDto> getByTrainingTreeNode(
            @PathVariable Long id) {
        TrainingCustomSlideNodeDto result =
                this.provider.findCustomSlideNodeByTreeNode(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/trainingCustomSlideNodes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.provider.deleteCustomSlideNode(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TrainingCustomSlideNodeResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/trainingCustomSlideNodes/{query}")
    public ResponseEntity<List<TrainingCustomSlideNodeDto>> search(
            String query) {
        List<TrainingCustomSlideNodeDto> result =
                this.provider.searchCustomSlideNodes(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
}
