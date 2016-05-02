package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.StatusColumn;
import org.appsec.securityRAT.domain.StatusColumnValue;

public class FEStatusColumnDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private Boolean isEnum;

	private Set<FEStatusColumnValueDTO> values;

	public FEStatusColumnDTO() {
	}

	public FEStatusColumnDTO(StatusColumn statusColumn) {
		this.id = statusColumn.getId();
		this.name = statusColumn.getName();
		this.description = statusColumn.getDescription();
		this.showOrder = statusColumn.getShowOrder();
		this.isEnum = statusColumn.getIsEnum();

		this.values = new HashSet<FEStatusColumnValueDTO>();
		Set<StatusColumnValue> statusColumnValues = statusColumn.getStatusColumnValues();
		for (StatusColumnValue statusColumnValue : statusColumnValues) {
			this.values.add(new FEStatusColumnValueDTO(statusColumnValue));
		}
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getDescription() {
		return description;
	}

	public Integer getShowOrder() {
		return showOrder;
	}

	public Boolean getIsEnum() {
		return isEnum;
	}

	public Set<FEStatusColumnValueDTO> getValues() {
		return values;
	}
}
