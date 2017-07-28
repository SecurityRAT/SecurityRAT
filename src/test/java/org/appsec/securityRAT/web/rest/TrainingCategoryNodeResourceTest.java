package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TrainingCategoryNode;
import org.appsec.securityRAT.repository.TrainingCategoryNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingCategoryNodeSearchRepository;

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
 * Test class for the TrainingCategoryNodeResource REST controller.
 *
 * @see TrainingCategoryNodeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingCategoryNodeResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";

    @Inject
    private TrainingCategoryNodeRepository trainingCategoryNodeRepository;

    @Inject
    private TrainingCategoryNodeSearchRepository trainingCategoryNodeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingCategoryNodeMockMvc;

    private TrainingCategoryNode trainingCategoryNode;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingCategoryNodeResource trainingCategoryNodeResource = new TrainingCategoryNodeResource();
        ReflectionTestUtils.setField(trainingCategoryNodeResource, "trainingCategoryNodeRepository", trainingCategoryNodeRepository);
        ReflectionTestUtils.setField(trainingCategoryNodeResource, "trainingCategoryNodeSearchRepository", trainingCategoryNodeSearchRepository);
        this.restTrainingCategoryNodeMockMvc = MockMvcBuilders.standaloneSetup(trainingCategoryNodeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        trainingCategoryNode = new TrainingCategoryNode();
        trainingCategoryNode.setName(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createTrainingCategoryNode() throws Exception {
        int databaseSizeBeforeCreate = trainingCategoryNodeRepository.findAll().size();

        // Create the TrainingCategoryNode

        restTrainingCategoryNodeMockMvc.perform(post("/api/trainingCategoryNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingCategoryNode)))
                .andExpect(status().isCreated());

        // Validate the TrainingCategoryNode in the database
        List<TrainingCategoryNode> trainingCategoryNodes = trainingCategoryNodeRepository.findAll();
        assertThat(trainingCategoryNodes).hasSize(databaseSizeBeforeCreate + 1);
        TrainingCategoryNode testTrainingCategoryNode = trainingCategoryNodes.get(trainingCategoryNodes.size() - 1);
        assertThat(testTrainingCategoryNode.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void getAllTrainingCategoryNodes() throws Exception {
        // Initialize the database
        trainingCategoryNodeRepository.saveAndFlush(trainingCategoryNode);

        // Get all the trainingCategoryNodes
        restTrainingCategoryNodeMockMvc.perform(get("/api/trainingCategoryNodes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(trainingCategoryNode.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getTrainingCategoryNode() throws Exception {
        // Initialize the database
        trainingCategoryNodeRepository.saveAndFlush(trainingCategoryNode);

        // Get the trainingCategoryNode
        restTrainingCategoryNodeMockMvc.perform(get("/api/trainingCategoryNodes/{id}", trainingCategoryNode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(trainingCategoryNode.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingTrainingCategoryNode() throws Exception {
        // Get the trainingCategoryNode
        restTrainingCategoryNodeMockMvc.perform(get("/api/trainingCategoryNodes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTrainingCategoryNode() throws Exception {
        // Initialize the database
        trainingCategoryNodeRepository.saveAndFlush(trainingCategoryNode);

		int databaseSizeBeforeUpdate = trainingCategoryNodeRepository.findAll().size();

        // Update the trainingCategoryNode
        trainingCategoryNode.setName(UPDATED_NAME);
        

        restTrainingCategoryNodeMockMvc.perform(put("/api/trainingCategoryNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingCategoryNode)))
                .andExpect(status().isOk());

        // Validate the TrainingCategoryNode in the database
        List<TrainingCategoryNode> trainingCategoryNodes = trainingCategoryNodeRepository.findAll();
        assertThat(trainingCategoryNodes).hasSize(databaseSizeBeforeUpdate);
        TrainingCategoryNode testTrainingCategoryNode = trainingCategoryNodes.get(trainingCategoryNodes.size() - 1);
        assertThat(testTrainingCategoryNode.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void deleteTrainingCategoryNode() throws Exception {
        // Initialize the database
        trainingCategoryNodeRepository.saveAndFlush(trainingCategoryNode);

		int databaseSizeBeforeDelete = trainingCategoryNodeRepository.findAll().size();

        // Get the trainingCategoryNode
        restTrainingCategoryNodeMockMvc.perform(delete("/api/trainingCategoryNodes/{id}", trainingCategoryNode.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TrainingCategoryNode> trainingCategoryNodes = trainingCategoryNodeRepository.findAll();
        assertThat(trainingCategoryNodes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
