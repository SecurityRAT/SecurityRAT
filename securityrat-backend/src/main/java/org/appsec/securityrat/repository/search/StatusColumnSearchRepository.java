package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.StatusColumn;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the StatusColumn entity.
 */
public interface StatusColumnSearchRepository extends ElasticsearchRepository<StatusColumn, Long> {
}
