package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.OptColumn;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the OptColumn entity.
 */
public interface OptColumnSearchRepository extends ElasticsearchRepository<OptColumn, Long> {
}
