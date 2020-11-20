package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.CollectionInstance;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the CollectionInstance entity.
 */
public interface CollectionInstanceSearchRepository extends ElasticsearchRepository<CollectionInstance, Long> {
}
