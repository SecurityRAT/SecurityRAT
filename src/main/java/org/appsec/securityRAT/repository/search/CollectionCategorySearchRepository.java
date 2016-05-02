package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.CollectionCategory;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the CollectionCategory entity.
 */
public interface CollectionCategorySearchRepository extends ElasticsearchRepository<CollectionCategory, Long> {
}
