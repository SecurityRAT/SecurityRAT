package org.appsec.securityrat.api.endpoint.training;

import java.util.List;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingTreeNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingTreeStatusDto;
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
public class TrainingTreeNodeResource {
    private static final String ENTITY_NAME = "trainingTreeNode";
    
    @Inject
    private TrainingNodeProvider provider;
    
    @PostMapping("/trainingTreeNodes")
    public ResponseEntity<TrainingTreeNodeDto> create(
            @RequestBody TrainingTreeNodeDto dto) {
        if (dto.getId() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.createTreeNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityCreationAlert(
                        TrainingTreeNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @PutMapping("/trainingTreeNodes")
    public ResponseEntity<TrainingTreeNodeDto> update(
            @RequestBody TrainingTreeNodeDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        if (!this.provider.updateTreeNode(dto)) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityUpdateAlert(
                        TrainingTreeNodeResource.ENTITY_NAME,
                        dto.getId()))
                .body(dto);
    }
    
    @GetMapping("/trainingTreeNodeUpdate/{id}")
    public ResponseEntity<TrainingTreeStatusDto> updateTreeReadOnly(
            @PathVariable Long id) {
        TrainingTreeStatusDto result = this.provider.updateTreeReadOnly(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/trainingTreeNodeUpdate")
    public ResponseEntity<TrainingTreeStatusDto> updateTree(
            @RequestBody TrainingTreeNodeDto dto) {
        TrainingTreeStatusDto result = this.provider.updateTree(dto);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingTreeNodes")
    public ResponseEntity<List<TrainingTreeNodeDto>> getAll() {
        List<TrainingTreeNodeDto> result = this.provider.findAllTreeNodes();
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingTreeNodes/{id}")
    public ResponseEntity<TrainingTreeNodeDto> get(@PathVariable Long id) {
        TrainingTreeNodeDto result =
                this.provider.getSubTreeById(id, false, true, null);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/trainingTreeNodesWithPreparedContent/{id}")
    public ResponseEntity<TrainingTreeNodeDto> getWithContent(
            @PathVariable Long id) {
        TrainingTreeNodeDto result =
                this.provider.getSubTreeById(id, true, false, null);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/trainingTreeNodes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!this.provider.deleteTreeNode(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok()
                .headers(SimpleResource.createEntityDeletionAlert(
                        TrainingTreeNodeResource.ENTITY_NAME,
                        id))
                .build();
    }
    
    @GetMapping("/_search/trainingTreeNodes/{query}")
    public ResponseEntity<List<TrainingTreeNodeDto>> search(
            @PathVariable String query) {
        List<TrainingTreeNodeDto> result = this.provider.searchTreeNodes(query);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingTreeNode/rootNode/{id}")
    public ResponseEntity<TrainingTreeNodeDto> getTrainingRoot(
            @PathVariable Long id) {
        TrainingTreeNodeDto result = this.provider.getTrainingRoot(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/TrainingTreeNode/childrenOf/{id}")
    public ResponseEntity<List<TrainingTreeNodeDto>> getChildrenOf(
            @PathVariable Long id) {
        List<TrainingTreeNodeDto> result = this.provider.getChildrenOf(id);
        
        if (result == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return ResponseEntity.ok(result);
    }
}
