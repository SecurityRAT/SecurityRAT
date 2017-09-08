package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingTreeNode entity.
 */
public interface TrainingTreeNodeSearchRepository extends ElasticsearchRepository<TrainingTreeNode, Long> {
}
