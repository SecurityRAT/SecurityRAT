package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.CollectionInstance;
import org.appsec.securityRAT.repository.CollectionInstanceRepository;
import org.appsec.securityRAT.repository.search.CollectionInstanceSearchRepository;

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
 * Test class for the CollectionInstanceResource REST controller.
 *
 * @see CollectionInstanceResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class CollectionInstanceResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";
    private static final String DEFAULT_DESCRIPTION = "SAMPLE_TEXT";
    private static final String UPDATED_DESCRIPTION = "UPDATED_TEXT";

    private static final Integer DEFAULT_SHOW_ORDER = 1;
    private static final Integer UPDATED_SHOW_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private CollectionInstanceRepository collectionInstanceRepository;

    @Inject
    private CollectionInstanceSearchRepository collectionInstanceSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restCollectionInstanceMockMvc;

    private CollectionInstance collectionInstance;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        CollectionInstanceResource collectionInstanceResource = new CollectionInstanceResource();
        ReflectionTestUtils.setField(collectionInstanceResource, "collectionInstanceRepository", collectionInstanceRepository);
        ReflectionTestUtils.setField(collectionInstanceResource, "collectionInstanceSearchRepository", collectionInstanceSearchRepository);
        this.restCollectionInstanceMockMvc = MockMvcBuilders.standaloneSetup(collectionInstanceResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        collectionInstance = new CollectionInstance();
        collectionInstance.setName(DEFAULT_NAME);
        collectionInstance.setDescription(DEFAULT_DESCRIPTION);
        collectionInstance.setShowOrder(DEFAULT_SHOW_ORDER);
        collectionInstance.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createCollectionInstance() throws Exception {
        int databaseSizeBeforeCreate = collectionInstanceRepository.findAll().size();

        // Create the CollectionInstance

        restCollectionInstanceMockMvc.perform(post("/api/collectionInstances")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(collectionInstance)))
                .andExpect(status().isCreated());

        // Validate the CollectionInstance in the database
        List<CollectionInstance> collectionInstances = collectionInstanceRepository.findAll();
        assertThat(collectionInstances).hasSize(databaseSizeBeforeCreate + 1);
        CollectionInstance testCollectionInstance = collectionInstances.get(collectionInstances.size() - 1);
        assertThat(testCollectionInstance.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCollectionInstance.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testCollectionInstance.getShowOrder()).isEqualTo(DEFAULT_SHOW_ORDER);
        assertThat(testCollectionInstance.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllCollectionInstances() throws Exception {
        // Initialize the database
        collectionInstanceRepository.saveAndFlush(collectionInstance);

        // Get all the collectionInstances
        restCollectionInstanceMockMvc.perform(get("/api/collectionInstances"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(collectionInstance.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
                .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
                .andExpect(jsonPath("$.[*].showOrder").value(hasItem(DEFAULT_SHOW_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getCollectionInstance() throws Exception {
        // Initialize the database
        collectionInstanceRepository.saveAndFlush(collectionInstance);

        // Get the collectionInstance
        restCollectionInstanceMockMvc.perform(get("/api/collectionInstances/{id}", collectionInstance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(collectionInstance.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.showOrder").value(DEFAULT_SHOW_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingCollectionInstance() throws Exception {
        // Get the collectionInstance
        restCollectionInstanceMockMvc.perform(get("/api/collectionInstances/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateCollectionInstance() throws Exception {
        // Initialize the database
        collectionInstanceRepository.saveAndFlush(collectionInstance);

		int databaseSizeBeforeUpdate = collectionInstanceRepository.findAll().size();

        // Update the collectionInstance
        collectionInstance.setName(UPDATED_NAME);
        collectionInstance.setDescription(UPDATED_DESCRIPTION);
        collectionInstance.setShowOrder(UPDATED_SHOW_ORDER);
        collectionInstance.setActive(UPDATED_ACTIVE);


        restCollectionInstanceMockMvc.perform(put("/api/collectionInstances")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(collectionInstance)))
                .andExpect(status().isOk());

        // Validate the CollectionInstance in the database
        List<CollectionInstance> collectionInstances = collectionInstanceRepository.findAll();
        assertThat(collectionInstances).hasSize(databaseSizeBeforeUpdate);
        CollectionInstance testCollectionInstance = collectionInstances.get(collectionInstances.size() - 1);
        assertThat(testCollectionInstance.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCollectionInstance.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testCollectionInstance.getShowOrder()).isEqualTo(UPDATED_SHOW_ORDER);
        assertThat(testCollectionInstance.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteCollectionInstance() throws Exception {
        // Initialize the database
        collectionInstanceRepository.saveAndFlush(collectionInstance);

		int databaseSizeBeforeDelete = collectionInstanceRepository.findAll().size();

        // Get the collectionInstance
        restCollectionInstanceMockMvc.perform(delete("/api/collectionInstances/{id}", collectionInstance.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<CollectionInstance> collectionInstances = collectionInstanceRepository.findAll();
        assertThat(collectionInstances).hasSize(databaseSizeBeforeDelete - 1);
    }
}
