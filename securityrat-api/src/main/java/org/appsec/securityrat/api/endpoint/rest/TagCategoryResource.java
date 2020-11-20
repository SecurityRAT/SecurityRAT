package org.appsec.securityrat.api.endpoint.rest;

import java.util.List;
import java.util.Set;
import org.appsec.securityrat.api.dto.rest.TagCategoryDto;
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
public class TagCategoryResource extends SimpleResource<Long, TagCategoryDto> {
    public TagCategoryResource() {
        super(TagCategoryDto.class);
    }

    @Override
    @PostMapping("/tagCategorys")
    public ResponseEntity<TagCategoryDto> create(
            @RequestBody TagCategoryDto dto) {
        return super.create(dto);
    }

    @Override
    @PutMapping("/tagCategorys")
    public ResponseEntity<TagCategoryDto> update(
            @RequestBody TagCategoryDto dto) {
        return super.update(dto);
    }

    @Override
    @GetMapping("/tagCategorys")
    public ResponseEntity<Set<TagCategoryDto>> getAll() {
        return super.getAll();
    }

    @Override
    @GetMapping("/tagCategorys/{id}")
    public ResponseEntity<TagCategoryDto> get(@PathVariable Long id) {
        return super.get(id);
    }

    @Override
    @DeleteMapping("/tagCategorys/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    @Override
    @GetMapping("/_search/tagCategorys/{query}")
    public ResponseEntity<List<TagCategoryDto>> search(
            @PathVariable String query) {
        return super.search(query);
    }
}
