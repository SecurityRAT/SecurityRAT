package org.appsec.securityrat.repository.search;

import org.appsec.securityrat.domain.TrainingCategoryNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingCategoryNode entity.
 */
public interface TrainingCategoryNodeSearchRepository extends ElasticsearchRepository<TrainingCategoryNode, Long> {
}
