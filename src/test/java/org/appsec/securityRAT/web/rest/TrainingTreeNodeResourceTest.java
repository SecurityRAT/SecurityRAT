package org.appsec.securityRAT.web.rest;

import org.appsec.securityRAT.Application;
import org.appsec.securityRAT.domain.TrainingTreeNode;
import org.appsec.securityRAT.repository.TrainingTreeNodeRepository;
import org.appsec.securityRAT.repository.search.TrainingTreeNodeSearchRepository;

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

import org.appsec.securityRAT.domain.enumeration.TrainingTreeNodeType;

/**
 * Test class for the TrainingTreeNodeResource REST controller.
 *
 * @see TrainingTreeNodeResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class TrainingTreeNodeResourceTest {


    private static final TrainingTreeNodeType DEFAULT_NODE_TYPE = TrainingTreeNodeType.RequirementNode;
    private static final TrainingTreeNodeType UPDATED_NODE_TYPE = TrainingTreeNodeType.GeneratedSlideNode;

    private static final Integer DEFAULT_SORT_ORDER = 1;
    private static final Integer UPDATED_SORT_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Inject
    private TrainingTreeNodeRepository trainingTreeNodeRepository;

    @Inject
    private TrainingTreeNodeSearchRepository trainingTreeNodeSearchRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    private MockMvc restTrainingTreeNodeMockMvc;

    private TrainingTreeNode trainingTreeNode;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        TrainingTreeNodeResource trainingTreeNodeResource = new TrainingTreeNodeResource();
        ReflectionTestUtils.setField(trainingTreeNodeResource, "trainingTreeNodeRepository", trainingTreeNodeRepository);
        ReflectionTestUtils.setField(trainingTreeNodeResource, "trainingTreeNodeSearchRepository", trainingTreeNodeSearchRepository);
        this.restTrainingTreeNodeMockMvc = MockMvcBuilders.standaloneSetup(trainingTreeNodeResource).setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {
        trainingTreeNode = new TrainingTreeNode();
        trainingTreeNode.setNode_type(DEFAULT_NODE_TYPE);
        trainingTreeNode.setSort_order(DEFAULT_SORT_ORDER);
        trainingTreeNode.setActive(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createTrainingTreeNode() throws Exception {
        int databaseSizeBeforeCreate = trainingTreeNodeRepository.findAll().size();

        // Create the TrainingTreeNode

        restTrainingTreeNodeMockMvc.perform(post("/api/trainingTreeNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingTreeNode)))
                .andExpect(status().isCreated());

        // Validate the TrainingTreeNode in the database
        List<TrainingTreeNode> trainingTreeNodes = trainingTreeNodeRepository.findAll();
        assertThat(trainingTreeNodes).hasSize(databaseSizeBeforeCreate + 1);
        TrainingTreeNode testTrainingTreeNode = trainingTreeNodes.get(trainingTreeNodes.size() - 1);
        assertThat(testTrainingTreeNode.getNode_type()).isEqualTo(DEFAULT_NODE_TYPE);
        assertThat(testTrainingTreeNode.getSort_order()).isEqualTo(DEFAULT_SORT_ORDER);
        assertThat(testTrainingTreeNode.getActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void getAllTrainingTreeNodes() throws Exception {
        // Initialize the database
        trainingTreeNodeRepository.saveAndFlush(trainingTreeNode);

        // Get all the trainingTreeNodes
        restTrainingTreeNodeMockMvc.perform(get("/api/trainingTreeNodes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(trainingTreeNode.getId().intValue())))
                .andExpect(jsonPath("$.[*].node_type").value(hasItem(DEFAULT_NODE_TYPE.toString())))
                .andExpect(jsonPath("$.[*].sort_order").value(hasItem(DEFAULT_SORT_ORDER)))
                .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }

    @Test
    @Transactional
    public void getTrainingTreeNode() throws Exception {
        // Initialize the database
        trainingTreeNodeRepository.saveAndFlush(trainingTreeNode);

        // Get the trainingTreeNode
        restTrainingTreeNodeMockMvc.perform(get("/api/trainingTreeNodes/{id}", trainingTreeNode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(trainingTreeNode.getId().intValue()))
            .andExpect(jsonPath("$.node_type").value(DEFAULT_NODE_TYPE.toString()))
            .andExpect(jsonPath("$.sort_order").value(DEFAULT_SORT_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingTrainingTreeNode() throws Exception {
        // Get the trainingTreeNode
        restTrainingTreeNodeMockMvc.perform(get("/api/trainingTreeNodes/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateTrainingTreeNode() throws Exception {
        // Initialize the database
        trainingTreeNodeRepository.saveAndFlush(trainingTreeNode);

		int databaseSizeBeforeUpdate = trainingTreeNodeRepository.findAll().size();

        // Update the trainingTreeNode
        trainingTreeNode.setNode_type(UPDATED_NODE_TYPE);
        trainingTreeNode.setSort_order(UPDATED_SORT_ORDER);
        trainingTreeNode.setActive(UPDATED_ACTIVE);
        

        restTrainingTreeNodeMockMvc.perform(put("/api/trainingTreeNodes")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(trainingTreeNode)))
                .andExpect(status().isOk());

        // Validate the TrainingTreeNode in the database
        List<TrainingTreeNode> trainingTreeNodes = trainingTreeNodeRepository.findAll();
        assertThat(trainingTreeNodes).hasSize(databaseSizeBeforeUpdate);
        TrainingTreeNode testTrainingTreeNode = trainingTreeNodes.get(trainingTreeNodes.size() - 1);
        assertThat(testTrainingTreeNode.getNode_type()).isEqualTo(UPDATED_NODE_TYPE);
        assertThat(testTrainingTreeNode.getSort_order()).isEqualTo(UPDATED_SORT_ORDER);
        assertThat(testTrainingTreeNode.getActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void deleteTrainingTreeNode() throws Exception {
        // Initialize the database
        trainingTreeNodeRepository.saveAndFlush(trainingTreeNode);

		int databaseSizeBeforeDelete = trainingTreeNodeRepository.findAll().size();

        // Get the trainingTreeNode
        restTrainingTreeNodeMockMvc.perform(delete("/api/trainingTreeNodes/{id}", trainingTreeNode.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<TrainingTreeNode> trainingTreeNodes = trainingTreeNodeRepository.findAll();
        assertThat(trainingTreeNodes).hasSize(databaseSizeBeforeDelete - 1);
    }
}
