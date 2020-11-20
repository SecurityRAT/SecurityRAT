package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.CollectionCategory;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the CollectionCategory entity.
 */
public interface CollectionCategorySearchRepository extends ElasticsearchRepository<CollectionCategory, Long> {
}
