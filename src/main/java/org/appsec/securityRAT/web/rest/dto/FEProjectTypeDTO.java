package org.appsec.securityRAT.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import org.appsec.securityRAT.domain.OptColumn;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.domain.StatusColumn;

public class FEProjectTypeDTO {

	private Long id;

	private String name;

	private String description;

	private Integer showOrder;

	private Set<FEOptionColumnDTO> optionColumns;

	private Set<FEStatusColumnDTO> statusColumns;

	public FEProjectTypeDTO() {
	}

	public FEProjectTypeDTO(ProjectType projectType) {

		this.id = projectType.getId();
		this.name = projectType.getName();
		this.description = projectType.getDescription();
		this.showOrder = projectType.getShowOrder();

		this.optionColumns = new HashSet<FEOptionColumnDTO>();
		Set<OptColumn> optColumnsForProjectType = projectType.getOptColumns();
		for (OptColumn optColumn : optColumnsForProjectType) {
			this.optionColumns.add(new FEOptionColumnDTO(optColumn));
		}

		this.statusColumns = new HashSet<FEStatusColumnDTO>();
		Set<StatusColumn> statusColumnsForProjectType = projectType.getStatusColumns();
		for (StatusColumn statusColumn : statusColumnsForProjectType) {
			this.statusColumns.add(new FEStatusColumnDTO(statusColumn));
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

	public Set<FEOptionColumnDTO> getOptionColumns() {
		return optionColumns;
	}

	public Set<FEStatusColumnDTO> getStatusColumns() {
		return statusColumns;
	}





}
