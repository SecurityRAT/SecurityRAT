package org.appsec.securityRAT.repository.search;

import org.appsec.securityRAT.domain.TrainingRequirementNode;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the TrainingRequirementNode entity.
 */
public interface TrainingRequirementNodeSearchRepository extends ElasticsearchRepository<TrainingRequirementNode, Long> {
}
