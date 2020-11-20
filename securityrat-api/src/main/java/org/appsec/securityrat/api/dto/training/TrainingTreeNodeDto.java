package org.appsec.securityrat.api.dto.training;

import java.util.List;
import lombok.Data;
import org.appsec.securityrat.api.dto.IdentifiableDto;

@Data
public class TrainingTreeNodeDto implements IdentifiableDto<Long> {
    private Long id;
    private TrainingTreeNodeType node_type;
    private Integer sort_order;
    private Boolean active;
    private String content;
    private String name;
    private boolean opened;
    private List<TrainingTreeNodeDto> children;
    private Integer anchor;
    private Long json_training_id;
    private Long json_universal_id;

    @Override
    public Class<Long> getIdentifierClass() {
        return Long.class;
    }
}
