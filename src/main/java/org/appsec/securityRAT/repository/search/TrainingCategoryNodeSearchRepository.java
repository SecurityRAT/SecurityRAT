package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.TrainingCategoryNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingCategoryNode entity.
 */
public interface TrainingCategoryNodeSearchRepository extends ElasticsearchRepository<TrainingCategoryNode, Long> {
}
