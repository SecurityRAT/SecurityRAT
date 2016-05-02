package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TagInstance;
import org.appsec.securityRAT.repository.TagInstanceRepository;
import org.appsec.securityRAT.repository.search.TagInstanceSearchRepository;

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
 * Test class for the TagInstanceResource REST controller.
 *
 * @see TagInstanceResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TagInstanceResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private TagInstanceRepository tagInstanceRepository;

    @Inject
    private TagInstanceSearchRepository tagInstanceSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTagInstanceMockMvc;

    private TagInstance tagInstance;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TagInstanceResource tagInstanceResource = new TagInstanceResource();
        ReflectionTestUtils.setField(tagInstanceResource, "tagInstanceRepository", tagInstanceRepository);
        ReflectionTestUtils.setField(tagInstanceResource, "tagInstanceSearchRepository", tagInstanceSearchRepository);
        this.restTagInstanceMockMvc = MockMvcBuilders.standaloneSetup(tagInstanceResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        tagInstance = new TagInstance();
        tagInstance.setName(DEFAULT_NAME);
        tagInstance.setDescription(DEFAULT_DESCRIPTION);
        tagInstance.setShowOrder(DEFAULT_SHOW_ORDER);
        tagInstance.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createTagInstance() throws Exception {
        int databaseSizeBeforeCreate = tagInstanceRepository.findAll().size();

        // Create the TagInstance

        restTagInstanceMockMvc.perform(post("/api/tagInstances")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(tagInstance)))
                .andExpect(status().isCreated());

        // Validate the TagInstance in the database
        List<TagInstance> tagInstances = tagInstanceRepository.findAll();
        assertThat(tagInstances).hasSize(databaseSizeBeforeCreate + 1);
        TagInstance testTagInstance = tagInstances.get(tagInstances.size() - 1);
        assertThat(testTagInstance.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTagInstance.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testTagInstance.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testTagInstance.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllTagInstances() throws Exception {
        // Initialize the database
        tagInstanceRepository.saveAndFlush(tagInstance);

        // Get all the tagInstances
        restTagInstanceMockMvc.perform(get("/api/tagInstances"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(tagInstance.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getTagInstance() throws Exception {
        // Initialize the database
        tagInstanceRepository.saveAndFlush(tagInstance);

        // Get the tagInstance
        restTagInstanceMockMvc.perform(get("/api/tagInstances/{id}", tagInstance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(tagInstance.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingTagInstance() throws Exception {
        // Get the tagInstance
        restTagInstanceMockMvc.perform(get("/api/tagInstances/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTagInstance() throws Exception {
        // Initialize the database
        tagInstanceRepository.saveAndFlush(tagInstance);

		int databaseSizeBeforeUpdate = tagInstanceRepository.findAll().size();

        // Update the tagInstance
        tagInstance.setName(UPDATED_NAME);
        tagInstance.setDescription(UPDATED_DESCRIPTION);
        tagInstance.setShowOrder(UPDATED_SHOW_ORDER);
        tagInstance.setActive(UPDATED_ACTIVE);


        restTagInstanceMockMvc.perform(put("/api/tagInstances")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(tagInstance)))
                .andExpect(status().isOk());

        // Validate the TagInstance in the database
        List<TagInstance> tagInstances = tagInstanceRepository.findAll();
        assertThat(tagInstances).hasSize(databaseSizeBeforeUpdate);
        TagInstance testTagInstance = tagInstances.get(tagInstances.size() - 1);
        assertThat(testTagInstance.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTagInstance.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testTagInstance.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testTagInstance.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteTagInstance() throws Exception {
        // Initialize the database
        tagInstanceRepository.saveAndFlush(tagInstance);

		int databaseSizeBeforeDelete = tagInstanceRepository.findAll().size();

        // Get the tagInstance
        restTagInstanceMockMvc.perform(delete("/api/tagInstances/{id}", tagInstance.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TagInstance> tagInstances = tagInstanceRepository.findAll();
        assertThat(tagInstances).hasSize(databaseSizeBeforeDelete - 1);
    }
}
