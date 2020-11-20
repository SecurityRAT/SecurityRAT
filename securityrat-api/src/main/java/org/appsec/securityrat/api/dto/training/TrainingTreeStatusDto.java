package org.appsec.securityrat.api.dto.training;

import lombok.Data;
import org.appsec.securityrat.api.dto.Dto;

@Data
public class TrainingTreeStatusDto implements Dto {
    private boolean hasUpdates;
}
