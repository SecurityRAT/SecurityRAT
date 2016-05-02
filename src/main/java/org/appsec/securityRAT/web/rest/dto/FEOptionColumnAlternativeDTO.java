package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.AlternativeSet;
import org.appsec.securityRAT.domain.OptColumn;

public class FEOptionColumnAlternativeDTO {

	private Long id;

	private Set<FEAlternativeSetDTO> alternativeSets;

	public FEOptionColumnAlternativeDTO() {
	}

	public FEOptionColumnAlternativeDTO(OptColumn optionColumn) {
		this.id = optionColumn.getId();
		this.alternativeSets = new HashSet<FEAlternativeSetDTO>();
		for (AlternativeSet alternativeSet : optionColumn.getAlternativeSets()) {
			this.alternativeSets.add(new FEAlternativeSetDTO(alternativeSet));
		}
	}

	public Long getId() {
		return id;
	}

	public Set<FEAlternativeSetDTO> getAlternativeSets() {
		return alternativeSets;
	}

}
