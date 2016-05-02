package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.ProjectType;
import org.appsec.securityRAT.repository.ProjectTypeRepository;
import org.appsec.securityRAT.repository.search.ProjectTypeSearchRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


/**
 * Test class for the ProjectTypeResource REST controller.
 *
 * @see ProjectTypeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class ProjectTypeResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private ProjectTypeRepository projectTypeRepository;

    @Inject
    private ProjectTypeSearchRepository projectTypeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restProjectTypeMockMvc;

    private ProjectType projectType;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ProjectTypeResource projectTypeResource = new ProjectTypeResource();
        ReflectionTestUtils.setField(projectTypeResource, "projectTypeRepository", projectTypeRepository);
        ReflectionTestUtils.setField(projectTypeResource, "projectTypeSearchRepository", projectTypeSearchRepository);
        this.restProjectTypeMockMvc = MockMvcBuilders.standaloneSetup(projectTypeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        projectType = new ProjectType();
        projectType.setName(DEFAULT_NAME);
        projectType.setDescription(DEFAULT_DESCRIPTION);
        projectType.setShowOrder(DEFAULT_SHOW_ORDER);
        projectType.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createProjectType() throws Exception {
        int databaseSizeBeforeCreate = projectTypeRepository.findAll().size();

        // Create the ProjectType

        restProjectTypeMockMvc.perform(post("/api/projectTypes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(projectType)))
                .andExpect(status().isCreated());

        // Validate the ProjectType in the database
        List<ProjectType> projectTypes = projectTypeRepository.findAll();
        assertThat(projectTypes).hasSize(databaseSizeBeforeCreate + 1);
        ProjectType testProjectType = projectTypes.get(projectTypes.size() - 1);
        assertThat(testProjectType.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testProjectType.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testProjectType.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testProjectType.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllProjectTypes() throws Exception {
        // Initialize the database
        projectTypeRepository.saveAndFlush(projectType);

        // Get all the projectTypes
        restProjectTypeMockMvc.perform(get("/api/projectTypes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(projectType.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getProjectType() throws Exception {
        // Initialize the database
        projectTypeRepository.saveAndFlush(projectType);

        // Get the projectType
        restProjectTypeMockMvc.perform(get("/api/projectTypes/{id}", projectType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(projectType.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingProjectType() throws Exception {
        // Get the projectType
        restProjectTypeMockMvc.perform(get("/api/projectTypes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProjectType() throws Exception {
        // Initialize the database
        projectTypeRepository.saveAndFlush(projectType);

		int databaseSizeBeforeUpdate = projectTypeRepository.findAll().size();

        // Update the projectType
        projectType.setName(UPDATED_NAME);
        projectType.setDescription(UPDATED_DESCRIPTION);
        projectType.setShowOrder(UPDATED_SHOW_ORDER);
        projectType.setActive(UPDATED_ACTIVE);


        restProjectTypeMockMvc.perform(put("/api/projectTypes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(projectType)))
                .andExpect(status().isOk());

        // Validate the ProjectType in the database
        List<ProjectType> projectTypes = projectTypeRepository.findAll();
        assertThat(projectTypes).hasSize(databaseSizeBeforeUpdate);
        ProjectType testProjectType = projectTypes.get(projectTypes.size() - 1);
        assertThat(testProjectType.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testProjectType.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testProjectType.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testProjectType.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteProjectType() throws Exception {
        // Initialize the database
        projectTypeRepository.saveAndFlush(projectType);

		int databaseSizeBeforeDelete = projectTypeRepository.findAll().size();

        // Get the projectType
        restProjectTypeMockMvc.perform(delete("/api/projectTypes/{id}", projectType.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<ProjectType> projectTypes = projectTypeRepository.findAll();
        assertThat(projectTypes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
