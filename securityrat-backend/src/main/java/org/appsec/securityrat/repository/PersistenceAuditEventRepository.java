package org.appsec.securityrat.repository;

import java.time.Instant;
import org.appsec.securityrat.domain.PersistentAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */
public interface PersistenceAuditEventRepository extends JpaRepository<PersistentAuditEvent, String> {

    List<PersistentAuditEvent> findByPrincipal(String principal);

    List<PersistentAuditEvent> findByPrincipalAndAuditEventDateAfter(String principal, Instant after);

    List<PersistentAuditEvent> findAllByAuditEventDateBetween(Instant fromDate, Instant toDate);
}
