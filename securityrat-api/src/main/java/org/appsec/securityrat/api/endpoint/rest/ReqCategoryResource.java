package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.ReqCategoryDto;
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
public class ReqCategoryResource extends SimpleResource<Long, ReqCategoryDto> {
    public ReqCategoryResource() {
        super(ReqCategoryDto.class);
    }

    @Override
    @PostMapping("/reqCategorys")
    public ResponseEntity<ReqCategoryDto> create(@RequestBody ReqCategoryDto dto) {
        return super.create(dto);
    }

    @Override
    @DeleteMapping("/reqCategorys/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    @Override
    @GetMapping("/reqCategorys/{id}")
    public ResponseEntity<ReqCategoryDto> get(@PathVariable Long id) {
        return super.get(id);
    }

    @Override
    @GetMapping("/reqCategorys")
    public ResponseEntity<Set<ReqCategoryDto>> getAll() {
        return super.getAll();
    }

    @Override
    @GetMapping("/_search/reqCategorys/{query}")
    public ResponseEntity<List<ReqCategoryDto>> search(
            @PathVariable String query) {
        return super.search(query);
    }

    @Override
    @PutMapping("/reqCategorys")
    public ResponseEntity<ReqCategoryDto> update(@RequestBody ReqCategoryDto dto) {
        return super.update(dto);
    }
}
