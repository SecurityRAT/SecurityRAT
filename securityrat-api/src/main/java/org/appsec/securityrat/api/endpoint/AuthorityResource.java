package org.appsec.securityrat.api.endpoint;

import java.util.List;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.AuthorityDto;
import org.appsec.securityrat.api.provider.SystemInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin-api")
public class AuthorityResource {
    @Inject
    private SystemInfo systemInfo;
    
    @GetMapping("/authorities")
    public ResponseEntity<List<AuthorityDto>> getAll() {
        return ResponseEntity.ok(this.systemInfo.getAuthorities());
    }
}
