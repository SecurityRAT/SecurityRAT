package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.AlternativeInstance;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the AlternativeInstance entity.
 */
public interface AlternativeInstanceSearchRepository extends ElasticsearchRepository<AlternativeInstance, Long> {
}
