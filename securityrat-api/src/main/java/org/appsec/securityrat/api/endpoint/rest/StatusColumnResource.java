package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.StatusColumnDto;
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
public class StatusColumnResource
        extends SimpleResource<Long, StatusColumnDto> {
    
    public StatusColumnResource() {
        super(StatusColumnDto.class);
    }

    @Override
    @PostMapping("/statusColumns")
    public ResponseEntity<StatusColumnDto> create(
            @RequestBody StatusColumnDto dto) {
        return super.create(dto);
    }

    @Override
    @PutMapping("/statusColumns")
    public ResponseEntity<StatusColumnDto> update(
            @RequestBody StatusColumnDto dto) {
        return super.update(dto);
    }

    @Override
    @GetMapping("/statusColumns")
    public ResponseEntity<Set<StatusColumnDto>> getAll() {
        return super.getAll();
    }

    @Override
    @GetMapping("/statusColumns/{id}")
    public ResponseEntity<StatusColumnDto> get(@PathVariable Long id) {
        return super.get(id);
    }

    @Override
    @DeleteMapping("/statusColumns/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    @Override
    @GetMapping("/_search/statusColumns/{query}")
    public ResponseEntity<List<StatusColumnDto>> search(
            @PathVariable String query) {
        return super.search(query);
    }
}
