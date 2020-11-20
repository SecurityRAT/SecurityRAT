package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.AlternativeInstanceDto;
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
public class AlternativeInstanceResource
        extends SimpleResource<Long, AlternativeInstanceDto> {
    
    public AlternativeInstanceResource() {
        super(AlternativeInstanceDto.class);
    }

    @Override
    @PostMapping("/alternativeInstances")
    public ResponseEntity<AlternativeInstanceDto> create(
            @RequestBody AlternativeInstanceDto dto) {
        return super.create(dto);
    }

    @Override
    @PutMapping("/alternativeInstances")
    public ResponseEntity<AlternativeInstanceDto> update(
            @RequestBody AlternativeInstanceDto dto) {
        return super.update(dto);
    }

    @Override
    @GetMapping("/alternativeInstances")
    public ResponseEntity<Set<AlternativeInstanceDto>> getAll() {
        return super.getAll();
    }

    @Override
    @GetMapping("/alternativeInstances/{id}")
    public ResponseEntity<AlternativeInstanceDto> get(
            @PathVariable Long id) {
        return super.get(id);
    }

    @Override
    @DeleteMapping("/alternativeInstances/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    @Override
    @GetMapping("/_search/alternativeInstances/{query}")
    public ResponseEntity<List<AlternativeInstanceDto>> search(
            @PathVariable String query) {
        return super.search(query);
    }
}
