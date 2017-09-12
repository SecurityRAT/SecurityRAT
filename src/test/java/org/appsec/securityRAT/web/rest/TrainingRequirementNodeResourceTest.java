package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TrainingRequirementNode;
import org.appsec.securityRAT.repository.TrainingRequirementNodeRepository;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingRequirementNodeSearchRepository;

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
 * Test class for the TrainingRequirementNodeResource REST controller.
 *
 * @see TrainingRequirementNodeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingRequirementNodeResourceTest {


    @Inject
    private TrainingRequirementNodeRepository trainingRequirementNodeRepository;

    @Inject
    private TrainingRequirementNodeSearchRepository trainingRequirementNodeSearchRepository;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingRequirementNodeMockMvc;

    private TrainingRequirementNode trainingRequirementNode;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingRequirementNodeResource trainingRequirementNodeResource = new TrainingRequirementNodeResource();
        ReflectionTestUtils.setField(trainingRequirementNodeResource, "trainingRequirementNodeRepository", trainingRequirementNodeRepository);
        ReflectionTestUtils.setField(trainingRequirementNodeResource, "trainingRequirementNodeSearchRepository", trainingRequirementNodeSearchRepository);
        ReflectionTestUtils.setField(trainingRequirementNodeResource, "trainingTreeNodeRepository", trainingTreeNodeRepository);
        this.restTrainingRequirementNodeMockMvc = MockMvcBuilders.standaloneSetup(trainingRequirementNodeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        trainingRequirementNode = new TrainingRequirementNode();
    }

    @Test
    @Transactional
    public void createTrainingRequirementNode() throws Exception {
        int databaseSizeBeforeCreate = trainingRequirementNodeRepository.findAll().size();

        // Create the TrainingRequirementNode

        restTrainingRequirementNodeMockMvc.perform(post("/api/trainingRequirementNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingRequirementNode)))
                .andExpect(status().isCreated());

        // Validate the TrainingRequirementNode in the database
        List<TrainingRequirementNode> trainingRequirementNodes = trainingRequirementNodeRepository.findAll();
        assertThat(trainingRequirementNodes).hasSize(databaseSizeBeforeCreate + 1);
        TrainingRequirementNode testTrainingRequirementNode = trainingRequirementNodes.get(trainingRequirementNodes.size() - 1);
    }

    @Test
    @Transactional
    public void getAllTrainingRequirementNodes() throws Exception {
        // Initialize the database
        trainingRequirementNodeRepository.saveAndFlush(trainingRequirementNode);

        // Get all the trainingRequirementNodes
        restTrainingRequirementNodeMockMvc.perform(get("/api/trainingRequirementNodes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(trainingRequirementNode.getId().intValue())));
    }

    @Test
    @Transactional
    public void getTrainingRequirementNode() throws Exception {
        // Initialize the database
        trainingRequirementNodeRepository.saveAndFlush(trainingRequirementNode);

        // Get the trainingRequirementNode
        restTrainingRequirementNodeMockMvc.perform(get("/api/trainingRequirementNodes/{id}", trainingRequirementNode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(trainingRequirementNode.getId().intValue()));
    }

    @Test
    @Transactional
    public void getNonExistingTrainingRequirementNode() throws Exception {
        // Get the trainingRequirementNode
        restTrainingRequirementNodeMockMvc.perform(get("/api/trainingRequirementNodes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTrainingRequirementNode() throws Exception {
        // Initialize the database
        trainingRequirementNodeRepository.saveAndFlush(trainingRequirementNode);

		int databaseSizeBeforeUpdate = trainingRequirementNodeRepository.findAll().size();

        // Update the trainingRequirementNode
        

        restTrainingRequirementNodeMockMvc.perform(put("/api/trainingRequirementNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingRequirementNode)))
                .andExpect(status().isOk());

        // Validate the TrainingRequirementNode in the database
        List<TrainingRequirementNode> trainingRequirementNodes = trainingRequirementNodeRepository.findAll();
        assertThat(trainingRequirementNodes).hasSize(databaseSizeBeforeUpdate);
        TrainingRequirementNode testTrainingRequirementNode = trainingRequirementNodes.get(trainingRequirementNodes.size() - 1);
    }

    @Test
    @Transactional
    public void deleteTrainingRequirementNode() throws Exception {
        // Initialize the database
        trainingRequirementNodeRepository.saveAndFlush(trainingRequirementNode);

		int databaseSizeBeforeDelete = trainingRequirementNodeRepository.findAll().size();

        // Get the trainingRequirementNode
        restTrainingRequirementNodeMockMvc.perform(delete("/api/trainingRequirementNodes/{id}", trainingRequirementNode.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TrainingRequirementNode> trainingRequirementNodes = trainingRequirementNodeRepository.findAll();
        assertThat(trainingRequirementNodes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
