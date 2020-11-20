package org.appsec.securityrat.api.endpoint;

import java.util.List;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.LoggerDto;
import org.appsec.securityrat.api.provider.SystemInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LogsResource {
    @Inject
    private SystemInfo systemInfo;
    
    @GetMapping("/logs")
    public ResponseEntity<List<LoggerDto>> getList() {
        return ResponseEntity.ok(this.systemInfo.getLoggers());
    }
    
    @PutMapping("/logs")
    public ResponseEntity<Void> changeLevel(@RequestBody LoggerDto dto) {
        this.systemInfo.updateLogger(dto);
        return ResponseEntity.noContent().build();
    }
}
