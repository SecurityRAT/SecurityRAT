package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.CollectionInstance;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the CollectionInstance entity.
 */
public interface CollectionInstanceSearchRepository extends ElasticsearchRepository<CollectionInstance, Long> {
}
