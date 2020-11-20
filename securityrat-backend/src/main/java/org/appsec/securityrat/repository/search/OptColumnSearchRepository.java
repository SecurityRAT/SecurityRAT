package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.OptColumn;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the OptColumn entity.
 */
public interface OptColumnSearchRepository extends ElasticsearchRepository<OptColumn, Long> {
}
