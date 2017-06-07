package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.SlideTemplate;
import org.appsec.securityRAT.repository.SlideTemplateRepository;
import org.appsec.securityRAT.repository.search.SlideTemplateSearchRepository;

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
 * Test class for the SlideTemplateResource REST controller.
 *
 * @see SlideTemplateResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class SlideTemplateResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";
    private static final String DEFAULT_CONTENT = "SAMPLE_TEXT";
    private static final String UPDATED_CONTENT = "UPDATED_TEXT";

    @Inject
    private SlideTemplateRepository slideTemplateRepository;

    @Inject
    private SlideTemplateSearchRepository slideTemplateSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restSlideTemplateMockMvc;

    private SlideTemplate slideTemplate;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        SlideTemplateResource slideTemplateResource = new SlideTemplateResource();
        ReflectionTestUtils.setField(slideTemplateResource, "slideTemplateRepository", slideTemplateRepository);
        ReflectionTestUtils.setField(slideTemplateResource, "slideTemplateSearchRepository", slideTemplateSearchRepository);
        this.restSlideTemplateMockMvc = MockMvcBuilders.standaloneSetup(slideTemplateResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        slideTemplate = new SlideTemplate();
        slideTemplate.setName(DEFAULT_NAME);
        slideTemplate.setDescription(DEFAULT_DESCRIPTION);
        slideTemplate.setContent(DEFAULT_CONTENT);
    }

    @Test
    @Transactional
    public void createSlideTemplate() throws Exception {
        int databaseSizeBeforeCreate = slideTemplateRepository.findAll().size();

        // Create the SlideTemplate

        restSlideTemplateMockMvc.perform(post("/api/slideTemplates")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(slideTemplate)))
                .andExpect(status().isCreated());

        // Validate the SlideTemplate in the database
        List<SlideTemplate> slideTemplates = slideTemplateRepository.findAll();
        assertThat(slideTemplates).hasSize(databaseSizeBeforeCreate + 1);
        SlideTemplate testSlideTemplate = slideTemplates.get(slideTemplates.size() - 1);
        assertThat(testSlideTemplate.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSlideTemplate.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testSlideTemplate.getContent()).isEqualTo(DEFAULT_CONTENT);
    }

    @Test
    @Transactional
    public void getAllSlideTemplates() throws Exception {
        // Initialize the database
        slideTemplateRepository.saveAndFlush(slideTemplate);

        // Get all the slideTemplates
        restSlideTemplateMockMvc.perform(get("/api/slideTemplates"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(slideTemplate.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())));
    }

    @Test
    @Transactional
    public void getSlideTemplate() throws Exception {
        // Initialize the database
        slideTemplateRepository.saveAndFlush(slideTemplate);

        // Get the slideTemplate
        restSlideTemplateMockMvc.perform(get("/api/slideTemplates/{id}", slideTemplate.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(slideTemplate.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingSlideTemplate() throws Exception {
        // Get the slideTemplate
        restSlideTemplateMockMvc.perform(get("/api/slideTemplates/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateSlideTemplate() throws Exception {
        // Initialize the database
        slideTemplateRepository.saveAndFlush(slideTemplate);

		int databaseSizeBeforeUpdate = slideTemplateRepository.findAll().size();

        // Update the slideTemplate
        slideTemplate.setName(UPDATED_NAME);
        slideTemplate.setDescription(UPDATED_DESCRIPTION);
        slideTemplate.setContent(UPDATED_CONTENT);
        

        restSlideTemplateMockMvc.perform(put("/api/slideTemplates")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(slideTemplate)))
                .andExpect(status().isOk());

        // Validate the SlideTemplate in the database
        List<SlideTemplate> slideTemplates = slideTemplateRepository.findAll();
        assertThat(slideTemplates).hasSize(databaseSizeBeforeUpdate);
        SlideTemplate testSlideTemplate = slideTemplates.get(slideTemplates.size() - 1);
        assertThat(testSlideTemplate.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSlideTemplate.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testSlideTemplate.getContent()).isEqualTo(UPDATED_CONTENT);
    }

    @Test
    @Transactional
    public void deleteSlideTemplate() throws Exception {
        // Initialize the database
        slideTemplateRepository.saveAndFlush(slideTemplate);

		int databaseSizeBeforeDelete = slideTemplateRepository.findAll().size();

        // Get the slideTemplate
        restSlideTemplateMockMvc.perform(delete("/api/slideTemplates/{id}", slideTemplate.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<SlideTemplate> slideTemplates = slideTemplateRepository.findAll();
        assertThat(slideTemplates).hasSize(databaseSizeBeforeDelete - 1);
    }
}
