package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.AlternativeSetDto;
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
public class AlternativeSetResource
        extends SimpleResource<Long, AlternativeSetDto> {
    
    public AlternativeSetResource() {
        super(AlternativeSetDto.class);
    }

    @Override
    @PostMapping("/alternativeSets")
    public ResponseEntity<AlternativeSetDto> create(
            @RequestBody AlternativeSetDto dto) {
        return super.create(dto);
    }

    @Override
    @PutMapping("/alternativeSets")
    public ResponseEntity<AlternativeSetDto> update(
            @RequestBody AlternativeSetDto dto) {
        return super.update(dto);
    }

    @Override
    @GetMapping("/alternativeSets")
    public ResponseEntity<Set<AlternativeSetDto>> getAll() {
        return super.getAll();
    }

    @Override
    @GetMapping("/alternativeSets/{id}")
    public ResponseEntity<AlternativeSetDto> get(@PathVariable Long id) {
        return super.get(id);
    }

    @Override
    @DeleteMapping("/alternativeSets/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    @Override
    @GetMapping("/_search/alternativeSets/{query}")
    public ResponseEntity<List<AlternativeSetDto>> search(
            @PathVariable String query) {
        return super.search(query);
    }
}
