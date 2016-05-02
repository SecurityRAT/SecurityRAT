package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.OptColumnContent;
import org.appsec.securityRAT.repository.OptColumnContentRepository;
import org.appsec.securityRAT.repository.search.OptColumnContentSearchRepository;

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
 * Test class for the OptColumnContentResource REST controller.
 *
 * @see OptColumnContentResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class OptColumnContentResourceTest {

    private static final String DEFAULT_CONTENT = "SAMPLE_TEXT";
    private static final String UPDATED_CONTENT = "UPDATED_TEXT";

    @Inject
    private OptColumnContentRepository optColumnContentRepository;

    @Inject
    private OptColumnContentSearchRepository optColumnContentSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restOptColumnContentMockMvc;

    private OptColumnContent optColumnContent;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        OptColumnContentResource optColumnContentResource = new OptColumnContentResource();
        ReflectionTestUtils.setField(optColumnContentResource, "optColumnContentRepository", optColumnContentRepository);
        ReflectionTestUtils.setField(optColumnContentResource, "optColumnContentSearchRepository", optColumnContentSearchRepository);
        this.restOptColumnContentMockMvc = MockMvcBuilders.standaloneSetup(optColumnContentResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        optColumnContent = new OptColumnContent();
        optColumnContent.setContent(DEFAULT_CONTENT);
    }

    @Test
    @Transactional
    public void createOptColumnContent() throws Exception {
        int databaseSizeBeforeCreate = optColumnContentRepository.findAll().size();

        // Create the OptColumnContent

        restOptColumnContentMockMvc.perform(post("/api/optColumnContents")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(optColumnContent)))
                .andExpect(status().isCreated());

        // Validate the OptColumnContent in the database
        List<OptColumnContent> optColumnContents = optColumnContentRepository.findAll();
        assertThat(optColumnContents).hasSize(databaseSizeBeforeCreate + 1);
        OptColumnContent testOptColumnContent = optColumnContents.get(optColumnContents.size() - 1);
        assertThat(testOptColumnContent.getContent()).isEqualTo(DEFAULT_CONTENT);
    }

    @Test
    @Transactional
    public void getAllOptColumnContents() throws Exception {
        // Initialize the database
        optColumnContentRepository.saveAndFlush(optColumnContent);

        // Get all the optColumnContents
        restOptColumnContentMockMvc.perform(get("/api/optColumnContents"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(optColumnContent.getId().intValue())))
                .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())));
    }

    @Test
    @Transactional
    public void getOptColumnContent() throws Exception {
        // Initialize the database
        optColumnContentRepository.saveAndFlush(optColumnContent);

        // Get the optColumnContent
        restOptColumnContentMockMvc.perform(get("/api/optColumnContents/{id}", optColumnContent.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(optColumnContent.getId().intValue()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingOptColumnContent() throws Exception {
        // Get the optColumnContent
        restOptColumnContentMockMvc.perform(get("/api/optColumnContents/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateOptColumnContent() throws Exception {
        // Initialize the database
        optColumnContentRepository.saveAndFlush(optColumnContent);

		int databaseSizeBeforeUpdate = optColumnContentRepository.findAll().size();

        // Update the optColumnContent
        optColumnContent.setContent(UPDATED_CONTENT);


        restOptColumnContentMockMvc.perform(put("/api/optColumnContents")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(optColumnContent)))
                .andExpect(status().isOk());

        // Validate the OptColumnContent in the database
        List<OptColumnContent> optColumnContents = optColumnContentRepository.findAll();
        assertThat(optColumnContents).hasSize(databaseSizeBeforeUpdate);
        OptColumnContent testOptColumnContent = optColumnContents.get(optColumnContents.size() - 1);
        assertThat(testOptColumnContent.getContent()).isEqualTo(UPDATED_CONTENT);
    }

    @Test
    @Transactional
    public void deleteOptColumnContent() throws Exception {
        // Initialize the database
        optColumnContentRepository.saveAndFlush(optColumnContent);

		int databaseSizeBeforeDelete = optColumnContentRepository.findAll().size();

        // Get the optColumnContent
        restOptColumnContentMockMvc.perform(delete("/api/optColumnContents/{id}", optColumnContent.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<OptColumnContent> optColumnContents = optColumnContentRepository.findAll();
        assertThat(optColumnContents).hasSize(databaseSizeBeforeDelete - 1);
    }
}
