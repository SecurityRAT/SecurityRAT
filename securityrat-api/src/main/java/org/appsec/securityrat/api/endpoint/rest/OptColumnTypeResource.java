package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.OptColumnTypeDto;
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
public class OptColumnTypeResource
        extends SimpleResource<Long, OptColumnTypeDto> {
    
    public OptColumnTypeResource() {
        super(OptColumnTypeDto.class);
    }
    
    @Override
    @PostMapping("/optColumnTypes")
    public ResponseEntity<OptColumnTypeDto> create(
            @RequestBody OptColumnTypeDto dto) {
        return super.create(dto);
    }

    @Override
    @DeleteMapping("/optColumnTypes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    @Override
    @GetMapping("/optColumnTypes/{id}")
    public ResponseEntity<OptColumnTypeDto> get(@PathVariable Long id) {
        return super.get(id);
    }

    @Override
    @GetMapping("/optColumnTypes")
    public ResponseEntity<Set<OptColumnTypeDto>> getAll() {
        return super.getAll();
    }

    @Override
    @GetMapping("/_search/optColumnTypes/{query}")
    public ResponseEntity<List<OptColumnTypeDto>> search(
            @PathVariable String query) {
        return super.search(query);
    }

    @Override
    @PutMapping("/optColumnTypes")
    public ResponseEntity<OptColumnTypeDto> update(
            @RequestBody OptColumnTypeDto dto) {
        return super.update(dto);
    }
}
