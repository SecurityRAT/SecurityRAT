package org.appsec.securityrat.api.endpoint;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.AuditEventDto;
import org.appsec.securityrat.api.provider.SystemInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuditResource {
    @Inject
    private SystemInfo systemInfo;
    
    @GetMapping("/audits/all")
    public ResponseEntity<List<AuditEventDto>> findAll() {
        return ResponseEntity.ok(this.systemInfo.getAuditEvents());
    }
    
    @GetMapping("/audits/byDates")
    public ResponseEntity<List<AuditEventDto>> findByDates(
            @RequestParam("fromDate") LocalDate fromDate,
            @RequestParam("toDate") LocalDate toDate) {
        
        Instant from = fromDate.atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        
        Instant to = toDate.atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        
        return ResponseEntity.ok(this.systemInfo.getAuditEvents(from, to));
    }
}
