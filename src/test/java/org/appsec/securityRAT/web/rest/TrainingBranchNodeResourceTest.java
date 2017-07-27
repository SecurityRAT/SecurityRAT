package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TrainingBranchNode;
import org.appsec.securityRAT.repository.TrainingBranchNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingBranchNodeSearchRepository;

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
 * Test class for the TrainingBranchNodeResource REST controller.
 *
 * @see TrainingBranchNodeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingBranchNodeResourceTest {

    private static final String DEFAULT_NAME = "SAMPLE_TEXT";
    private static final String UPDATED_NAME = "UPDATED_TEXT";

    @Inject
    private TrainingBranchNodeRepository trainingBranchNodeRepository;

    @Inject
    private TrainingBranchNodeSearchRepository trainingBranchNodeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingBranchNodeMockMvc;

    private TrainingBranchNode trainingBranchNode;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingBranchNodeResource trainingBranchNodeResource = new TrainingBranchNodeResource();
        ReflectionTestUtils.setField(trainingBranchNodeResource, "trainingBranchNodeRepository", trainingBranchNodeRepository);
        ReflectionTestUtils.setField(trainingBranchNodeResource, "trainingBranchNodeSearchRepository", trainingBranchNodeSearchRepository);
        this.restTrainingBranchNodeMockMvc = MockMvcBuilders.standaloneSetup(trainingBranchNodeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        trainingBranchNode = new TrainingBranchNode();
        trainingBranchNode.setName(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void createTrainingBranchNode() throws Exception {
        int databaseSizeBeforeCreate = trainingBranchNodeRepository.findAll().size();

        // Create the TrainingBranchNode

        restTrainingBranchNodeMockMvc.perform(post("/api/trainingBranchNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingBranchNode)))
                .andExpect(status().isCreated());

        // Validate the TrainingBranchNode in the database
        List<TrainingBranchNode> trainingBranchNodes = trainingBranchNodeRepository.findAll();
        assertThat(trainingBranchNodes).hasSize(databaseSizeBeforeCreate + 1);
        TrainingBranchNode testTrainingBranchNode = trainingBranchNodes.get(trainingBranchNodes.size() - 1);
        assertThat(testTrainingBranchNode.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    public void getAllTrainingBranchNodes() throws Exception {
        // Initialize the database
        trainingBranchNodeRepository.saveAndFlush(trainingBranchNode);

        // Get all the trainingBranchNodes
        restTrainingBranchNodeMockMvc.perform(get("/api/trainingBranchNodes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(trainingBranchNode.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getTrainingBranchNode() throws Exception {
        // Initialize the database
        trainingBranchNodeRepository.saveAndFlush(trainingBranchNode);

        // Get the trainingBranchNode
        restTrainingBranchNodeMockMvc.perform(get("/api/trainingBranchNodes/{id}", trainingBranchNode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(trainingBranchNode.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingTrainingBranchNode() throws Exception {
        // Get the trainingBranchNode
        restTrainingBranchNodeMockMvc.perform(get("/api/trainingBranchNodes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTrainingBranchNode() throws Exception {
        // Initialize the database
        trainingBranchNodeRepository.saveAndFlush(trainingBranchNode);

		int databaseSizeBeforeUpdate = trainingBranchNodeRepository.findAll().size();

        // Update the trainingBranchNode
        trainingBranchNode.setName(UPDATED_NAME);
        

        restTrainingBranchNodeMockMvc.perform(put("/api/trainingBranchNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingBranchNode)))
                .andExpect(status().isOk());

        // Validate the TrainingBranchNode in the database
        List<TrainingBranchNode> trainingBranchNodes = trainingBranchNodeRepository.findAll();
        assertThat(trainingBranchNodes).hasSize(databaseSizeBeforeUpdate);
        TrainingBranchNode testTrainingBranchNode = trainingBranchNodes.get(trainingBranchNodes.size() - 1);
        assertThat(testTrainingBranchNode.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    public void deleteTrainingBranchNode() throws Exception {
        // Initialize the database
        trainingBranchNodeRepository.saveAndFlush(trainingBranchNode);

		int databaseSizeBeforeDelete = trainingBranchNodeRepository.findAll().size();

        // Get the trainingBranchNode
        restTrainingBranchNodeMockMvc.perform(delete("/api/trainingBranchNodes/{id}", trainingBranchNode.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TrainingBranchNode> trainingBranchNodes = trainingBranchNodeRepository.findAll();
        assertThat(trainingBranchNodes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
