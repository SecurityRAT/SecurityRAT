package org.appsec.securityrat.provider;

import com.google.common.base.Preconditions;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.inject.Inject;
import org.appsec.securityrat.api.dto.training.TrainingBranchNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingCategoryNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingCustomSlideNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingGeneratedSlideNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingRequirementNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingTreeNodeDto;
import org.appsec.securityrat.api.dto.training.TrainingTreeStatusDto;
import org.appsec.securityrat.api.provider.TrainingNodeProvider;
import org.appsec.securityrat.domain.CollectionInstance;
import org.appsec.securityrat.domain.OptColumn;
import org.appsec.securityrat.domain.OptColumnContent;
import org.appsec.securityrat.domain.ProjectType;
import org.appsec.securityrat.domain.ReqCategory;
import org.appsec.securityrat.domain.RequirementSkeleton;
import org.appsec.securityrat.domain.Training;
import org.appsec.securityrat.domain.TrainingBranchNode;
import org.appsec.securityrat.domain.TrainingCategoryNode;
import org.appsec.securityrat.domain.TrainingCustomSlideNode;
import org.appsec.securityrat.domain.TrainingGeneratedSlideNode;
import org.appsec.securityrat.domain.TrainingRequirementNode;
import org.appsec.securityrat.domain.TrainingTreeNode;
import org.appsec.securityrat.domain.TrainingTreeStatus;
import org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.BranchNode;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.CategoryNode;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.ContentNode;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.CustomSlideNode;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.GeneratedSlideNode;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.RequirementNode;
import static org.appsec.securityrat.domain.enumeration.TrainingTreeNodeType.RootNode;
import org.appsec.securityrat.domain.util.TrainingNodePool;
import org.appsec.securityrat.provider.mapper.training.TrainingBranchNodeMapper;
import org.appsec.securityrat.provider.mapper.training.TrainingCategoryNodeMapper;
import org.appsec.securityrat.provider.mapper.training.TrainingCustomSlideNodeMapper;
import org.appsec.securityrat.provider.mapper.training.TrainingGeneratedSlideNodeMapper;
import org.appsec.securityrat.provider.mapper.training.TrainingRequirementNodeMapper;
import org.appsec.securityrat.provider.mapper.training.TrainingTreeNodeMapper;
import org.appsec.securityrat.provider.mapper.training.TrainingTreeStatusMapper;
import org.appsec.securityrat.repository.CollectionInstanceRepository;
import org.appsec.securityrat.repository.OptColumnContentRepository;
import org.appsec.securityrat.repository.OptColumnRepository;
import org.appsec.securityrat.repository.ProjectTypeRepository;
import org.appsec.securityrat.repository.ReqCategoryRepository;
import org.appsec.securityrat.repository.RequirementSkeletonRepository;
import org.appsec.securityrat.repository.TrainingBranchNodeRepository;
import org.appsec.securityrat.repository.TrainingCategoryNodeRepository;
import org.appsec.securityrat.repository.TrainingCustomSlideNodeRepository;
import org.appsec.securityrat.repository.TrainingGeneratedSlideNodeRepository;
import org.appsec.securityrat.repository.TrainingRepository;
import org.appsec.securityrat.repository.TrainingRequirementNodeRepository;
import org.appsec.securityrat.repository.TrainingTreeNodeRepository;
import org.appsec.securityrat.repository.search.TrainingBranchNodeSearchRepository;
import org.appsec.securityrat.repository.search.TrainingCategoryNodeSearchRepository;
import org.appsec.securityrat.repository.search.TrainingCustomSlideNodeSearchRepository;
import org.appsec.securityrat.repository.search.TrainingGeneratedSlideNodeSearchRepository;
import org.appsec.securityrat.repository.search.TrainingRequirementNodeSearchRepository;
import org.appsec.securityrat.repository.search.TrainingTreeNodeSearchRepository;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.stereotype.Service;

@Service
public class TrainingNodeProviderImpl implements TrainingNodeProvider {
    // anchor = PARENT_ANCHOR means that the node is anchored on it's parent
    private static final int PARENT_ANCHOR = -2;
    // json_universal_id = -1 for an TrainingGeneratedSlideNode means that this is a skeleton slide
    private static final int SKELETON_UNIVERSAL_ID = -1;
    private static final String CONTENT_NODE_NAME = "Contents";
    
    private class SeparatedChildren {
        private TreeMap<Integer, List<TrainingTreeNode>> customNodes;
        private TreeMap<Integer, List<TrainingTreeNode>> databaseNodes;


        public TreeMap<Integer, List<TrainingTreeNode>> getCustomNodes() {
            return customNodes;
        }
        public void setCustomNodes(TreeMap<Integer, List<TrainingTreeNode>> customNodes) {
            this.customNodes = customNodes;
        }
        public TreeMap<Integer, List<TrainingTreeNode>> getDatabaseNodes() {
            return databaseNodes;
        }
        public void setDatabaseNodes(TreeMap<Integer, List<TrainingTreeNode>> databaseNodes) {
            this.databaseNodes = databaseNodes;
        }
    }
    
    // comparator to sort nodes by their sort_order
    private class SortOrderComparator implements Comparator<TrainingTreeNode> {
        @Override
        public int compare(TrainingTreeNode o1, TrainingTreeNode o2) {
            if (o1.getSort_order() < o2.getSort_order())
                return -1;
            else if (o1.getSort_order() > o2.getSort_order())
                return 1;
            return 0;
        }
    }
    
    @Inject
    private TrainingBranchNodeRepository branchNodeRepo;
    
    @Inject
    private TrainingCategoryNodeRepository categoryNodeRepo;
    
    @Inject
    private TrainingCustomSlideNodeRepository customSlideNodeRepo;
    
    @Inject
    private TrainingGeneratedSlideNodeRepository generatedSlideNodeRepo;
    
    @Inject
    private TrainingRequirementNodeRepository requirementNodeRepo;
    
    @Inject
    private TrainingTreeNodeRepository treeNodeRepo;
    
    @Inject
    private TrainingRepository trainingRepo;
    
    @Inject
    private ReqCategoryRepository reqCategoryRepo;
    
    @Inject
    private OptColumnRepository optColumnRepo;
    
    @Inject
    private OptColumnContentRepository optColumnContentRepo;
    
    @Inject
    private CollectionInstanceRepository collectionInstanceRepo;
    
    @Inject
    private ProjectTypeRepository projectTypeRepo;
    
    @Inject
    private RequirementSkeletonRepository requirementSkeletonRepo;
    
    @Inject
    private TrainingBranchNodeSearchRepository branchNodeSearchRepo;
    
    @Inject
    private TrainingCategoryNodeSearchRepository categoryNodeSearchRepo;
    
    @Inject
    private TrainingCustomSlideNodeSearchRepository customSlideNodeSearchRepo;
    
    @Inject
    private TrainingGeneratedSlideNodeSearchRepository generatedSlideNodeSearchRepo;
    
    @Inject
    private TrainingRequirementNodeSearchRepository requirementNodeSearchRepo;
    
    @Inject
    private TrainingTreeNodeSearchRepository treeNodeSearchRepo;
    
    @Inject
    private TrainingBranchNodeMapper branchNodeMapper;
    
    @Inject
    private TrainingCategoryNodeMapper categoryNodeMapper;
    
    @Inject
    private TrainingCustomSlideNodeMapper customSlideNodeMapper;
    
    @Inject
    private TrainingGeneratedSlideNodeMapper generatedSlideNodeMapper;
    
    @Inject
    private TrainingRequirementNodeMapper requirementNodeMapper;
    
    @Inject
    private TrainingTreeNodeMapper treeNodeMapper;
    
    @Inject
    private TrainingTreeStatusMapper treeStatusMapper;
    
    @Override
    public boolean createBranchNode(TrainingBranchNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingBranchNode entity = this.branchNodeMapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        this.branchNodeRepo.save(entity);
        this.branchNodeSearchRepo.save(entity);
        
        dto.setId(entity.getId());
        return true;
    }

    @Override
    public boolean createCategoryNode(TrainingCategoryNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingCategoryNode entity = this.categoryNodeMapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        this.categoryNodeRepo.save(entity);
        this.categoryNodeSearchRepo.save(entity);
        
        dto.setId(entity.getId());
        return true;
    }

    @Override
    public boolean createCustomSlideNode(TrainingCustomSlideNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingCustomSlideNode entity =
                this.customSlideNodeMapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        this.customSlideNodeRepo.save(entity);
        this.customSlideNodeSearchRepo.save(entity);
        
        dto.setId(entity.getId());
        return true;
    }

    @Override
    public boolean createGeneratedSlideNode(TrainingGeneratedSlideNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingGeneratedSlideNode entity =
                this.generatedSlideNodeMapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        this.generatedSlideNodeRepo.save(entity);
        this.generatedSlideNodeSearchRepo.save(entity);
        
        dto.setId(entity.getId());
        return true;
    }

    @Override
    public boolean createRequirementNode(TrainingRequirementNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingRequirementNode entity =
                this.requirementNodeMapper.toEntity(dto);
        
        if (entity.getId() != null) {
            return false;
        }
        
        this.requirementNodeRepo.save(entity);
        this.requirementNodeSearchRepo.save(entity);
        
        dto.setId(entity.getId());
        return true;
    }

    @Override
    public boolean createTreeNode(TrainingTreeNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        this.treeNodeMapper.updateDto(
                this.create(this.treeNodeMapper.toEntity(dto)),
                dto);
        
        return true;
    }

    @Override
    public boolean updateBranchNode(TrainingBranchNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingBranchNode entity = this.branchNodeMapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        this.branchNodeRepo.save(entity);
        this.branchNodeSearchRepo.save(entity);
        
        return true;
    }

    @Override
    public boolean updateCategoryNode(TrainingCategoryNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingCategoryNode entity = this.categoryNodeMapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        this.categoryNodeRepo.save(entity);
        this.categoryNodeSearchRepo.save(entity);
        
        return true;
    }

    @Override
    public boolean updateCustomSlideNode(TrainingCustomSlideNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingCustomSlideNode entity =
                this.customSlideNodeMapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        this.customSlideNodeRepo.save(entity);
        this.customSlideNodeSearchRepo.save(entity);
        
        return true;
    }

    @Override
    public boolean updateGeneratedSlideNode(TrainingGeneratedSlideNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingGeneratedSlideNode entity =
                this.generatedSlideNodeMapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        this.generatedSlideNodeRepo.save(entity);
        this.generatedSlideNodeSearchRepo.save(entity);
        
        return true;
    }

    @Override
    public boolean updateRequirementNode(TrainingRequirementNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        TrainingRequirementNode entity =
                this.requirementNodeMapper.toEntity(dto);
        
        if (entity.getId() == null) {
            return false;
        }
        
        this.requirementNodeRepo.save(entity);
        this.requirementNodeSearchRepo.save(entity);
        
        return true;
    }

    @Override
    public boolean updateTreeNode(TrainingTreeNodeDto dto) {
        Preconditions.checkNotNull(dto);
        
        this.treeNodeMapper.updateDto(
                this.update(this.treeNodeMapper.toEntity(dto)),
                dto);
        
        return true;
    }

    @Override
    public boolean deleteBranchNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingBranchNode entity =
                this.branchNodeRepo.findById(id)
                        .orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.branchNodeRepo.delete(entity);
        this.branchNodeSearchRepo.delete(entity);
        
        return true;
    }

    @Override
    public boolean deleteCategoryNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingCategoryNode entity =
                this.categoryNodeRepo.findById(id)
                        .orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.categoryNodeRepo.delete(entity);
        this.categoryNodeSearchRepo.delete(entity);
        
        return true;
    }

    @Override
    public boolean deleteCustomSlideNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingCustomSlideNode entity =
                this.customSlideNodeRepo.findById(id)
                        .orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.customSlideNodeRepo.delete(entity);
        this.customSlideNodeSearchRepo.delete(entity);
        
        return true;
    }

    @Override
    public boolean deleteGeneratedSlideNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingGeneratedSlideNode entity =
                this.generatedSlideNodeRepo.findById(id)
                        .orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.generatedSlideNodeRepo.delete(entity);
        this.generatedSlideNodeSearchRepo.delete(entity);
        
        return true;
    }

    @Override
    public boolean deleteRequirementNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingRequirementNode entity =
                this.requirementNodeRepo.findById(id)
                        .orElse(null);
        
        if (entity == null) {
            return false;
        }
        
        this.requirementNodeRepo.delete(entity);
        this.requirementNodeSearchRepo.delete(entity);
        
        return true;
    }

    @Override
    public boolean deleteTreeNode(Long id) {
        Preconditions.checkNotNull(id);
        this.delete(id);
        return true;
    }

    @Override
    public TrainingBranchNodeDto findBranchNode(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.branchNodeRepo.findById(id)
                .map(this.branchNodeMapper::toDto)
                .orElse(null);
    }

    @Override
    public TrainingCategoryNodeDto findCategoryNode(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.categoryNodeRepo.findById(id)
                .map(this.categoryNodeMapper::toDto)
                .orElse(null);
    }

    @Override
    public TrainingCustomSlideNodeDto findCustomSlideNode(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.customSlideNodeRepo.findById(id)
                .map(this.customSlideNodeMapper::toDto)
                .orElse(null);
    }

    @Override
    public TrainingGeneratedSlideNodeDto findGeneratedSlideNode(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.generatedSlideNodeRepo.findById(id)
                .map(this.generatedSlideNodeMapper::toDto)
                .orElse(null);
    }

    @Override
    public TrainingRequirementNodeDto findRequirementNode(Long id) {
        Preconditions.checkNotNull(id);
        
        return this.requirementNodeRepo.findById(id)
                .map(this.requirementNodeMapper::toDto)
                .orElse(null);
    }

    @Override
    public Set<TrainingBranchNodeDto> findAllBranchNodes() {
        return this.branchNodeRepo.findAll()
                .stream()
                .map(this.branchNodeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<TrainingCategoryNodeDto> findAllCategoryNodes() {
        return this.categoryNodeRepo.findAll()
                .stream()
                .map(this.categoryNodeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<TrainingCustomSlideNodeDto> findAllCustomSlideNodes() {
        return this.customSlideNodeRepo.findAll()
                .stream()
                .map(this.customSlideNodeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<TrainingGeneratedSlideNodeDto> findAllGeneratedSlideNodes() {
        return this.generatedSlideNodeRepo.findAll()
                .stream()
                .map(this.generatedSlideNodeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<TrainingRequirementNodeDto> findAllRequirementNodes() {
        return this.requirementNodeRepo.findAll()
                .stream()
                .map(this.requirementNodeMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    public List<TrainingTreeNodeDto> findAllTreeNodes() {
        return this.treeNodeRepo.findAll()
                .stream()
                .map(this.treeNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingBranchNodeDto> searchBranchNodes(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.branchNodeSearchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.branchNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingCategoryNodeDto> searchCategoryNodes(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.categoryNodeSearchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.categoryNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingCustomSlideNodeDto> searchCustomSlideNodes(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.customSlideNodeSearchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.customSlideNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingGeneratedSlideNodeDto> searchGeneratedSlideNodes(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.generatedSlideNodeSearchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.generatedSlideNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingRequirementNodeDto> searchRequirementNodes(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.requirementNodeSearchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.requirementNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrainingTreeNodeDto> searchTreeNodes(String query) {
        Preconditions.checkNotNull(query);
        
        return StreamSupport.stream(this.treeNodeSearchRepo.search(
                QueryBuilders.queryStringQuery(query)).spliterator(),
                false)
                .map(this.treeNodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TrainingBranchNodeDto findBranchNodeByTreeNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingTreeNode treeNode = this.treeNodeRepo.findById(id)
                .orElse(null);
        
        if (treeNode == null) {
            return null;
        }
        
        TrainingBranchNode targetNode =
                this.branchNodeRepo.getTrainingBranchNodeByTrainingTreeNode(
                        treeNode);
        
        if (targetNode == null) {
            return null;
        }
        
        return this.branchNodeMapper.toDto(targetNode);
    }

    @Override
    public TrainingCategoryNodeDto findCategoryNodeByTreeNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingTreeNode treeNode = this.treeNodeRepo.findById(id)
                .orElse(null);
        
        if (treeNode == null) {
            return null;
        }
        
        TrainingCategoryNode targetNode =
                this.categoryNodeRepo.getTrainingCategoryNodeByTrainingTreeNode(
                        treeNode);
        
        if (targetNode == null) {
            return null;
        }
        
        return this.categoryNodeMapper.toDto(targetNode);
    }

    @Override
    public TrainingCustomSlideNodeDto findCustomSlideNodeByTreeNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingTreeNode treeNode = this.treeNodeRepo.findById(id)
                .orElse(null);
        
        if (treeNode == null) {
            return null;
        }
        
        TrainingCustomSlideNode targetNode =
                this.customSlideNodeRepo.getTrainingCustomSlideNodeByTrainingTreeNode(
                        treeNode);
        
        if (targetNode == null) {
            return null;
        }
        
        return this.customSlideNodeMapper.toDto(targetNode);
    }

    @Override
    public TrainingGeneratedSlideNodeDto findGeneratedSlideNodeByTreeNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingTreeNode treeNode = this.treeNodeRepo.findById(id)
                .orElse(null);
        
        if (treeNode == null) {
            return null;
        }
        
        TrainingGeneratedSlideNode targetNode =
                this.generatedSlideNodeRepo.getTrainingGeneratedSlideNodeByTrainingTreeNode(
                        treeNode);
        
        if (targetNode == null) {
            return null;
        }
        
        return this.generatedSlideNodeMapper.toDto(targetNode);
    }

    @Override
    public TrainingRequirementNodeDto findRequirementNodeByTreeNode(Long id) {
        Preconditions.checkNotNull(id);
        
        TrainingTreeNode treeNode = this.treeNodeRepo.findById(id)
                .orElse(null);
        
        if (treeNode == null) {
            return null;
        }
        
        TrainingRequirementNode targetNode =
                this.requirementNodeRepo.getTrainingRequirementNodeByTrainingTreeNode(
                        treeNode);
        
        if (targetNode == null) {
            return null;
        }
        
        return this.requirementNodeMapper.toDto(targetNode);
    }

    @Override
    public TrainingTreeStatusDto updateTreeReadOnly(Long id) {
        TrainingTreeNode trainingTreeNode = this.treeNodeRepo.findById(id).orElse(null);
        TrainingTreeStatus result = this.startTreeUpdate(true, trainingTreeNode);
        
        return this.treeStatusMapper.toDto(result);
    }

    @Override
    public TrainingTreeStatusDto updateTree(TrainingTreeNodeDto idWrapped) {
        TrainingTreeNode trainingTreeNode = this.treeNodeRepo.findById(idWrapped.getId()).orElse(null);
        TrainingTreeStatus result = this.startTreeUpdate(false, trainingTreeNode);
        
        return this.treeStatusMapper.toDto(result);
    }

    @Override
    public TrainingTreeNodeDto getSubTreeById(Long id, boolean prepareContent, boolean includeIds, String parentName) {
        TrainingTreeNode result = this.getSubTreeById_Real(id, prepareContent, includeIds, parentName);
        
        if (result == null) {
            return null;
        }
        
        return this.treeNodeMapper.toDto(result);
    }

    @Override
    public TrainingTreeNodeDto getTrainingRoot(Long id) {
        Training training = this.trainingRepo.getOne(id);
        TrainingTreeNode result = this.treeNodeRepo.getTrainingRoot(training);
        
        return this.treeNodeMapper.toDto(result);
    }

    @Override
    public List<TrainingTreeNodeDto> getChildrenOf(Long id) {
        TrainingTreeNode node = this.treeNodeRepo.getOne(id);
        List<TrainingTreeNode> result = this.treeNodeRepo.getChildrenOf(node);

        return result.stream()
                .map(this.treeNodeMapper::toDto)
                .collect(Collectors.toList());
    }
    
    private TrainingTreeNode create(TrainingTreeNode trainingTreeNode) {
        // fetch the related training because the json format only contains it's id
        
        if (trainingTreeNode.getNode_type() == TrainingTreeNodeType.RootNode) {
            Training training = this.trainingRepo.findById(trainingTreeNode.getJson_training_id()).orElse(null);
            trainingTreeNode.setTraining_id(training);
        }
        
        if (trainingTreeNode.getActive() == null)
            trainingTreeNode.setActive(true);

        TrainingTreeNode result = this.treeNodeRepo.save(trainingTreeNode);
        this.treeNodeSearchRepo.save(result);

        // create special node entities
        switch (trainingTreeNode.getNode_type()) {
        case CustomSlideNode:
            TrainingCustomSlideNode customSlideNode = new TrainingCustomSlideNode();
            customSlideNode.setNode(trainingTreeNode);
            customSlideNode.setName(trainingTreeNode.getName());
            customSlideNode.setAnchor(trainingTreeNode.getAnchor());
            customSlideNode.setContent(trainingTreeNode.getContent());
            this.customSlideNodeRepo.save(customSlideNode);
            break;
        case BranchNode:
            TrainingBranchNode branchNode = new TrainingBranchNode();
            branchNode.setNode(trainingTreeNode);
            branchNode.setAnchor(trainingTreeNode.getAnchor());
            branchNode.setName(trainingTreeNode.getName());
            this.branchNodeRepo.save(branchNode);
            break;
        case CategoryNode:
            TrainingCategoryNode categoryNode = new TrainingCategoryNode();
            categoryNode.setNode(trainingTreeNode);
            Long categoryId = trainingTreeNode.getJson_universal_id();
            ReqCategory category = null;
            if (categoryId != null)
                category = this.reqCategoryRepo.findById(categoryId).orElse(null);
            categoryNode.setCategory(category);
            this.categoryNodeRepo.save(categoryNode);
            break;
        case RequirementNode:
            TrainingRequirementNode requirementNode = new TrainingRequirementNode();
            requirementNode.setNode(trainingTreeNode);
            Long requirementId = trainingTreeNode.getJson_universal_id();
            RequirementSkeleton skeleton = null;
            if (requirementId != null)
                skeleton = this.requirementSkeletonRepo.findById(requirementId).orElse(null);
            requirementNode.setRequirementSkeleton(skeleton);
            this.requirementNodeRepo.save(requirementNode);
            break;
        case GeneratedSlideNode:
            TrainingGeneratedSlideNode generatedSlideNode = new TrainingGeneratedSlideNode();
            generatedSlideNode.setNode(trainingTreeNode);
            Long optColumnId = trainingTreeNode.getJson_universal_id();
            OptColumn optColumn = null;
            if (optColumnId != null && optColumnId >= 0)
                optColumn = this.optColumnRepo.findById(optColumnId).orElse(null);
            generatedSlideNode.setOptColumn(optColumn);
            this.generatedSlideNodeRepo.save(generatedSlideNode);
            break;
        }

        int sort_order = 0;
        Training training = result.getTraining_id();
        for (TrainingTreeNode child : trainingTreeNode.getChildren()) {
            child.setParent_id(result);
            child.setTraining_id(training);
            child.setSort_order(sort_order++);
            this.create(child);
        }
        
        return result;
    }
    
    private TrainingTreeNode update(TrainingTreeNode trainingTreeNode) {
        Training training = this.trainingRepo.findById(trainingTreeNode.getJson_training_id()).orElse(null);
        TrainingTreeNode oldTree = this.treeNodeRepo.getTrainingRoot(training);

        // 1. save the new tree to db
        trainingTreeNode.setId(null);
        TrainingTreeNode newTree = this.create(trainingTreeNode);

        // 2. delete the old tree
        this.delete(oldTree.getId());

        return newTree;
    }
    
    private void delete(Long id) {
        TrainingTreeNode trainingTreeNode = this.treeNodeRepo.findById(id).orElse(null);

        // delete special table entry
        this.deleteSpecialTableEntry(trainingTreeNode);

        // delete children
        for (TrainingTreeNode childNode : this.treeNodeRepo.getChildrenOf(trainingTreeNode)) {
            this.delete(childNode.getId());
        }

        this.treeNodeRepo.deleteById(id);
        this.treeNodeSearchRepo.deleteById(id);
    }
    
    private void deleteSpecialTableEntry(TrainingTreeNode trainingTreeNode) {
        switch (trainingTreeNode.getNode_type()) {
        case BranchNode:
            TrainingBranchNode branchNode = this.branchNodeRepo
                    .getTrainingBranchNodeByTrainingTreeNode(trainingTreeNode);
            if (branchNode != null)
                this.branchNodeRepo.delete(branchNode);
            break;
        case CustomSlideNode:
            TrainingCustomSlideNode customSlideNode = this.customSlideNodeRepo
                    .getTrainingCustomSlideNodeByTrainingTreeNode(trainingTreeNode);
            if (customSlideNode != null)
                this.customSlideNodeRepo.delete(customSlideNode);
            break;
        case CategoryNode:
            TrainingCategoryNode categoryNode = this.categoryNodeRepo
                    .getTrainingCategoryNodeByTrainingTreeNode(trainingTreeNode);
            if (categoryNode != null)
                this.categoryNodeRepo.delete(categoryNode);
            break;
        case RequirementNode:
            TrainingRequirementNode requirementNode = this.requirementNodeRepo
                    .getTrainingRequirementNodeByTrainingTreeNode(trainingTreeNode);
            if (requirementNode != null)
                this.requirementNodeRepo.delete(requirementNode);
            break;
        case GeneratedSlideNode:
            TrainingGeneratedSlideNode generatedSlideNode = this.generatedSlideNodeRepo
                    .getTrainingGeneratedSlideNodeByTrainingTreeNode(trainingTreeNode);
            if (generatedSlideNode != null)
                this.generatedSlideNodeRepo.delete(generatedSlideNode);
            break;
        }
    }
    
    // loads necessary data and starts the update (if readonly=true no data will be changed)
    private TrainingTreeStatus startTreeUpdate(boolean readOnly, TrainingTreeNode trainingTreeNode) {
        TrainingTreeStatus result = new TrainingTreeStatus();

        Training training = this.trainingRepo.findOneWithEagerRelationships(trainingTreeNode.getTraining_id().getId());

        // build categories with requirements for selection
        List<CollectionInstance> collectionInstances = new ArrayList<>();
        List<ProjectType> projectTypes = new ArrayList<>();
        if (training.getAllRequirementsSelected()) {
            collectionInstances = this.collectionInstanceRepo.findAll();
            projectTypes = this.projectTypeRepo.findAll();
        } else {
            collectionInstances.addAll(training.getCollections());
            projectTypes.addAll(training.getProjectTypes());
            if (projectTypes.size() == 0 && collectionInstances.size() > 0)
                projectTypes = this.projectTypeRepo.findAll();
        }
        List<ReqCategory> reqCategories;
        if (projectTypes.size() > 0 && collectionInstances.size() > 0)
            reqCategories = this.reqCategoryRepo.findEagerlyCategoriesWithRequirements(collectionInstances,
                    projectTypes);
        else
            reqCategories = new ArrayList<>();

        // get selected OptColumns
        List<OptColumn> selectedOptColumns = new ArrayList<>();
        selectedOptColumns.add(null); // this represents the "skeleton" slide
        for (OptColumn optColumn : training.getOptColumns()) {
            selectedOptColumns.add(optColumn);
        }

        // start the update
        boolean hasUpdates = this.updateSubTree(trainingTreeNode, reqCategories, selectedOptColumns, readOnly);
        result.setHasUpdates(hasUpdates);

        if(!readOnly) {
            // update has finished, try to assign custom nodes which belong to moved (or deleted) requirements
            TrainingNodePool pool = TrainingNodePool.getInstance(training.getId());
            HashMap<Long, List<TrainingTreeNode>> nodesToAssign = pool.getAll();
            ArrayList<TrainingTreeNode> modifiedParents = new ArrayList<>();
            for (Long requirementId : nodesToAssign.keySet()) {
                TrainingTreeNode newParent = this.findRequirementNode(trainingTreeNode, requirementId);
                for (TrainingTreeNode nodeToAssign : nodesToAssign.get(requirementId)) {
                    if (newParent != null) {
                        nodeToAssign.setParent_id(newParent);
                        this.treeNodeRepo.save(nodeToAssign);
                        modifiedParents.add(newParent);
                    } else {
                        // failed to find a new parent
                        // => reset parent
                        // => reset positional info to avoid "reordering" on next update check

                        TrainingTreeNode parent = pool.getOldParentId(nodeToAssign.getId());
                        nodeToAssign.setParent_id(parent);
                        nodeToAssign.setSort_order(this.getHighestSortOrder(parent));
                        this.treeNodeRepo.save(nodeToAssign);

                        // reset anchor
                        if(nodeToAssign.getNode_type() == BranchNode) {
                            TrainingBranchNode branchNode = this.branchNodeRepo
                                .getTrainingBranchNodeByTrainingTreeNode(nodeToAssign);
                            branchNode.setAnchor(this.getLastAnchor(parent));
                            this.branchNodeRepo.save(branchNode);
                        } else if(nodeToAssign.getNode_type() == CustomSlideNode) {
                            TrainingCustomSlideNode customSlideNode = this.customSlideNodeRepo
                                .getTrainingCustomSlideNodeByTrainingTreeNode(nodeToAssign);
                            customSlideNode.setAnchor(this.getLastAnchor(parent));
                            this.customSlideNodeRepo.save(customSlideNode);
                        }
                    }
                }
                for (TrainingTreeNode modifiedParent : modifiedParents) {
                    this.recalculateChildrenSortOrder(modifiedParent);
                }
            }
        }

        return result;
    }
    
    private boolean updateSubTree(TrainingTreeNode trainingTreeNode, List<ReqCategory> reqCategories,
            List<OptColumn> selectedOptColumns, boolean readOnly) {
        boolean hasUpdates = false;
        TrainingNodePool pool = TrainingNodePool.getInstance(trainingTreeNode.getTraining_id().getId());

        SeparatedChildren separatedChildren = getSeparatedChildren(trainingTreeNode);

        List<TrainingTreeNode> childrenNewOrder;

        switch (trainingTreeNode.getNode_type()) {
        case ContentNode:

            // fetch category nodes inside this branch
            List<TrainingCategoryNode> categoryNodes = new ArrayList<>();
            for (List<TrainingTreeNode> databaseNodesForShowOrder : separatedChildren.getDatabaseNodes().values()) {
                for(TrainingTreeNode databaseNode : databaseNodesForShowOrder)
                    categoryNodes
                        .add(this.categoryNodeRepo.getTrainingCategoryNodeByTrainingTreeNode(databaseNode));
            }

            // search for each selected category and delete / add to match the lists
            for (ReqCategory selectedCategory : reqCategories) {
                boolean foundSelectedCategory = false;
                TrainingCategoryNode foundNode = null;
                for (TrainingCategoryNode categoryNode : categoryNodes) {
                    if (categoryNode.getCategory().getId().equals(selectedCategory.getId())) {
                        foundSelectedCategory = true;
                        foundNode = categoryNode;
                        break;
                    }
                }
                if (foundSelectedCategory) {
                    categoryNodes.remove(foundNode); // pass: this category is on the correct position
                } else if(selectedCategory.getRequirementSkeletons().size() > 0) {
                    hasUpdates = true;
                    if (readOnly)
                        return true;
                    else {
                        // add the missing category to the database
                        TrainingTreeNode new_baseNode = new TrainingTreeNode();
                        new_baseNode.setNode_type(CategoryNode);

                        int nextSortOrder = getHighestSortOrder(trainingTreeNode.getId()) + 1;
                        new_baseNode.setSort_order(nextSortOrder);
                        new_baseNode.setActive(true);
                        new_baseNode.setParent_id(trainingTreeNode);
                        new_baseNode.setTraining_id(trainingTreeNode.getTraining_id());
                        new_baseNode.setJson_universal_id(selectedCategory.getId());
                        new_baseNode = this.treeNodeRepo.save(new_baseNode);
                        TrainingCategoryNode new_categoryNode = new TrainingCategoryNode();
                        new_categoryNode.setNode(new_baseNode);
                        new_categoryNode.setCategory(selectedCategory);
                        this.categoryNodeRepo.save(new_categoryNode);

                        Integer showOrder = selectedCategory.getShowOrder();
                        if(separatedChildren.getDatabaseNodes().get(showOrder) == null)
                            separatedChildren.getDatabaseNodes().put(showOrder, new ArrayList<>());
                        separatedChildren.getDatabaseNodes().get(showOrder).add(new_baseNode);
                    }
                }
            }
            if (categoryNodes.size() > 0) {
                hasUpdates = true;
                if (readOnly)
                    return true;
                else {
                    for (TrainingCategoryNode categoryNodeToRemove : categoryNodes) {
                        // delete Category for update

                        TrainingTreeNode baseNode = categoryNodeToRemove.getNode();
                        Long anchor = categoryNodeToRemove.getCategory().getId();
                        List<TrainingTreeNode> anchoredNodes = separatedChildren.getCustomNodes().get(anchor);
                        // remove anchors of anchored nodes
                        if (anchoredNodes != null && anchoredNodes.size() > 0) {
                            for (TrainingTreeNode anchoredNode : anchoredNodes) {
                                this.removeAnchor(anchoredNode);
                            }
                        }
                        // add custom nodes inside RequirementNodes to TrainingNodePool
                        List<TrainingTreeNode> catChildren = this.treeNodeRepo.getChildrenOf(baseNode);
                        if (catChildren != null)
                            for (TrainingTreeNode child : catChildren) {
                                if (child.getNode_type() == RequirementNode) {
                                    List<TrainingTreeNode> grandChildren = this.treeNodeRepo
                                            .getChildrenOf(child);
                                    if (grandChildren != null) {
                                        for (TrainingTreeNode grandchild : grandChildren) {
                                            TrainingTreeNodeType type = grandchild.getNode_type();
                                            if (type == CustomSlideNode || type == BranchNode) {

                                                // this grandchild needs to be saved
                                                TrainingRequirementNode parentReqNode = this.requirementNodeRepo
                                                        .getTrainingRequirementNodeByTrainingTreeNode(child);
                                                if (parentReqNode != null
                                                        && parentReqNode.getRequirementSkeleton() != null) {
                                                    Long requirementId = parentReqNode.getRequirementSkeleton().getId();
                                                    pool.addCustomNode(requirementId, grandchild, baseNode.getParent_id());
                                                    grandchild.setParent_id(null);
                                                    this.treeNodeRepo.save(grandchild);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        /*
                            note that extractCustomNodes() will move all customNodes in the subtree to the parent -
                            this prevents loss of custom nodes as they are not deleted. If a better position is
                            found later on, they will be moved again. Therefore they were added to the pool.
                         */
                        // move remaining custom nodes and delete hole subtree
                        delete(baseNode.getId());
                    }
                }
            }

            break;
        case CategoryNode:
            // fetch requirement nodes inside this branch
            List<TrainingRequirementNode> requirementNodes = new ArrayList<>();
            for (List<TrainingTreeNode> databaseNodesForShowOrder : separatedChildren.getDatabaseNodes().values()) {
                for(TrainingTreeNode databaseNode : databaseNodesForShowOrder)
                    requirementNodes.add(
                        this.requirementNodeRepo.getTrainingRequirementNodeByTrainingTreeNode(databaseNode));
            }

            // find the matching category by linear search
            TrainingCategoryNode thisCategoryNode = this.categoryNodeRepo
                    .getTrainingCategoryNodeByTrainingTreeNode(trainingTreeNode);
            ReqCategory thisCategory = null;
            for (ReqCategory category : reqCategories) {
                if (thisCategoryNode != null
                        && thisCategoryNode.getCategory() != null
                        && thisCategoryNode.getCategory().getId().equals(category.getId())) {
                    thisCategory = category;
                    break;
                }
            }
            if (thisCategory != null) {
                // search for each selected requirement and delete / add to match the lists
                for (RequirementSkeleton selectedRequirement : thisCategory.getRequirementSkeletons()) {
                    boolean foundSelectedRequirement = false;
                    TrainingRequirementNode foundNode = null;
                    for (TrainingRequirementNode requirementNode : requirementNodes) {
                        if (requirementNode.getRequirementSkeleton().getId().equals(selectedRequirement.getId())) {
                            foundSelectedRequirement = true;
                            foundNode = requirementNode;
                            break;
                        }
                    }
                    if (foundSelectedRequirement) {
                        requirementNodes.remove(foundNode); // no need to check this node again
                    } else {
                        hasUpdates = true;
                        if (readOnly)
                            return true;
                        else {
                            // add the missing requirement to the tree in database
                            TrainingTreeNode new_baseNode = new TrainingTreeNode();
                            new_baseNode.setNode_type(RequirementNode);

                            int nextSortOrder = this.getHighestSortOrder(trainingTreeNode.getId()) + 1;
                            new_baseNode.setSort_order(nextSortOrder);
                            new_baseNode.setActive(true);
                            new_baseNode.setParent_id(trainingTreeNode);
                            new_baseNode.setTraining_id(trainingTreeNode.getTraining_id());
                            new_baseNode.setJson_universal_id(selectedRequirement.getId());
                            new_baseNode = this.treeNodeRepo.save(new_baseNode);
                            TrainingRequirementNode new_requirementNode = new TrainingRequirementNode();
                            new_requirementNode.setNode(new_baseNode);
                            new_requirementNode.setRequirementSkeleton(selectedRequirement);
                            this.requirementNodeRepo.save(new_requirementNode);

                            // check the pool if there are custom nodes which need to be placed inside the new node
                            List<TrainingTreeNode> nodesToRestore = pool.getCustomNodes(selectedRequirement.getId());
                            if (nodesToRestore != null) {
                                for (TrainingTreeNode nodeToRestore : nodesToRestore) {
                                    nodeToRestore.setParent_id(new_baseNode);
                                    this.treeNodeRepo.save(nodeToRestore);
                                }
                                pool.removeCustomNodes(selectedRequirement.getId());
                            }

                            Integer showOrder = selectedRequirement.getShowOrder();
                            if(separatedChildren.getDatabaseNodes().get(showOrder) == null)
                                separatedChildren.getDatabaseNodes().put(showOrder, new ArrayList<>());
                            separatedChildren.getDatabaseNodes().get(showOrder).add(new_baseNode);
                        }
                    }
                }
                if (requirementNodes.size() > 0) {
                    hasUpdates = true;
                    if (readOnly)
                        return true;
                    else {
                        for (TrainingRequirementNode requirementNodeToRemove : requirementNodes) {

                            // add custom nodes to the pool (so they can be moved to a new place if the requirement
                            // needs to be added somewhere else (in another category)
                            TrainingTreeNode baseNode = requirementNodeToRemove.getNode();
                            List<TrainingTreeNode> reqChildren = this.treeNodeRepo
                                    .getChildrenOf(baseNode);
                            for (TrainingTreeNode child : reqChildren) {
                                TrainingTreeNodeType type = child.getNode_type();
                                if (type == CustomSlideNode || type == BranchNode) {
                                    if (requirementNodeToRemove.getRequirementSkeleton() != null) {
                                        Long requirementId = requirementNodeToRemove.getRequirementSkeleton().getId();
                                        pool.addCustomNode(requirementId, child, baseNode.getParent_id());
                                        child.setParent_id(null);
                                        this.treeNodeRepo.save(child);
                                    }
                                }
                            }

                            delete(baseNode.getId());
                        }
                    }
                }
            }
            break;
        case RequirementNode:
            // fetch GeneratedSlideNodes inside this RequirementNode
            List<TrainingGeneratedSlideNode> generatedSlideNodes = new ArrayList<>();
            for (List<TrainingTreeNode> databaseNodesForShowOrder : separatedChildren.getDatabaseNodes().values()) {
                for(TrainingTreeNode databaseNode : databaseNodesForShowOrder)
                    generatedSlideNodes.add(this.generatedSlideNodeRepo
                            .getTrainingGeneratedSlideNodeByTrainingTreeNode(databaseNode));
            }

            // search for each selected optColumn and delete / add GenerateSlideNodes to match the lists
            for (OptColumn selectedOptColumn : selectedOptColumns) {
                boolean foundSelectedOptColumn = false;
                TrainingGeneratedSlideNode foundNode = null;
                for (TrainingGeneratedSlideNode generatedSlideNode : generatedSlideNodes) {
                    if ((generatedSlideNode.getOptColumn() == null && selectedOptColumn == null)
                            || ((generatedSlideNode.getOptColumn() != null && selectedOptColumn != null)
                                    && (generatedSlideNode.getOptColumn().getId().equals(selectedOptColumn.getId())))) {
                        foundSelectedOptColumn = true;
                        foundNode = generatedSlideNode;
                        break;
                    }
                }
                if (foundSelectedOptColumn) {
                    generatedSlideNodes.remove(foundNode); // no need to check this node again
                } else {
                    hasUpdates = true;
                    if (readOnly)
                        return true;
                    else {
                        // add the missing requirement to the tree in database
                        TrainingTreeNode new_baseNode = new TrainingTreeNode();
                        new_baseNode.setNode_type(GeneratedSlideNode);

                        int nextSortOrder = 0;
                        new_baseNode.setSort_order(nextSortOrder);
                        new_baseNode.setActive(true);
                        new_baseNode.setParent_id(trainingTreeNode);
                        new_baseNode.setTraining_id(trainingTreeNode.getTraining_id());
                        Long universal_id = selectedOptColumn != null ? selectedOptColumn.getId() : new Long(SKELETON_UNIVERSAL_ID);
                        new_baseNode.setJson_universal_id(universal_id);
                        new_baseNode = this.treeNodeRepo.save(new_baseNode);
                        TrainingGeneratedSlideNode new_generatedSlideNode = new TrainingGeneratedSlideNode();
                        new_generatedSlideNode.setNode(new_baseNode);
                        new_generatedSlideNode.setOptColumn(selectedOptColumn);
                        this.generatedSlideNodeRepo.save(new_generatedSlideNode);

                        Integer showOrder = 0;
                        if (selectedOptColumn != null)
                            showOrder = selectedOptColumn.getShowOrder();

                        if(separatedChildren.getDatabaseNodes().get(showOrder) == null)
                            separatedChildren.getDatabaseNodes().put(showOrder, new ArrayList<>());
                        separatedChildren.getDatabaseNodes().get(showOrder).add(new_baseNode);
                    }
                }
            }
            if (generatedSlideNodes.size() > 0) {
                hasUpdates = true;
                if (readOnly)
                    return true;
                else {
                    for (TrainingGeneratedSlideNode generatedSlideNodeToRemove : generatedSlideNodes) {
                        TrainingTreeNode baseNode = generatedSlideNodeToRemove.getNode();
                        delete(baseNode.getId());
                    }
                }
            }

            break;
        }

        // 2. reorder children
        childrenNewOrder = this.reorder_children(separatedChildren);

        // update sort_order in database
        int new_sortOrder = 0;
        for (TrainingTreeNode child : childrenNewOrder) {
            // the new sort_order is smaller than the old, order needs to be corrected
            // this way jumps between sort_orders (0->2->3->5) can pass without update popup
            // while (0->2->1) will not pass
            if (child.getSort_order() < new_sortOrder) {
                hasUpdates = true;
                if (readOnly)
                    return true;
                else {
                    child.setSort_order(new_sortOrder);
                    this.treeNodeRepo.save(child);
                }
            }
            new_sortOrder = child.getSort_order() + 1;
        }

        // process (updated) children recursively
        List<TrainingTreeNode> children = this.treeNodeRepo.getChildrenOf(trainingTreeNode);
        for (TrainingTreeNode child : children) {
            TrainingTreeNodeType node_type = child.getNode_type();
            if (node_type == ContentNode || node_type == CategoryNode || node_type == RequirementNode) {
                if (updateSubTree(child, reqCategories, selectedOptColumns, readOnly)) {
                    hasUpdates = true;
                    if (readOnly)
                        return true;
                }
            }
        }

        return hasUpdates;
    }
    
    // helper function to find a TrainingTreeNode in a subtree
    private TrainingTreeNode findRequirementNode(TrainingTreeNode subtree, Long requirementId) {
        TrainingTreeNode result = null;
        TrainingTreeNodeType type = subtree.getNode_type();
        if (type == RequirementNode) {
            TrainingRequirementNode reqNode = this.requirementNodeRepo
                    .getTrainingRequirementNodeByTrainingTreeNode(subtree);
            if (reqNode.getRequirementSkeleton().getId().equals(requirementId))
                result = subtree; // found!
        } else {
            if (type == ContentNode || type == CategoryNode || type == RootNode) {
                List<TrainingTreeNode> children = this.treeNodeRepo.getChildrenOf(subtree);
                if (children != null) {
                    for (TrainingTreeNode child : children) {
                        TrainingTreeNode subResult = findRequirementNode(child, requirementId);
                        if (subResult != null) {
                            result = subResult;
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }
    
    private int getHighestSortOrder(TrainingTreeNode parentNode) {
        return getHighestSortOrder(parentNode.getId());
    }

    private int getHighestSortOrder(Long parentNodeId) {
        Integer highestSortOrder = this.treeNodeRepo.getHighestSortOrder(parentNodeId);
        return highestSortOrder != null ? highestSortOrder + 1 : 0;
    }
    
    // get the last anchor for a parent node
    private int getLastAnchor(TrainingTreeNode parentNode) {
        int lastAnchor = PARENT_ANCHOR;
        List<TrainingTreeNode> children = this.treeNodeRepo.getChildrenOf(parentNode);
        if (children != null) {
            for (int i = children.size() - 1; i > 0; i--) {
                TrainingTreeNode child = children.get(i);
                TrainingTreeNodeType child_type = child.getNode_type();
                if (child.getJson_universal_id() != null) {
                    lastAnchor = Math.toIntExact(child.getJson_universal_id());
                    break;
                }
                if (child_type == GeneratedSlideNode) {
                    TrainingGeneratedSlideNode generatedSlideNode = this.generatedSlideNodeRepo
                            .getTrainingGeneratedSlideNodeByTrainingTreeNode(child);
                    if (generatedSlideNode != null) {
                        if (generatedSlideNode.getOptColumn() == null)
                            lastAnchor = SKELETON_UNIVERSAL_ID;
                        else
                            lastAnchor = Math.toIntExact(generatedSlideNode.getOptColumn().getId());
                        break;
                    }
                } else if (child_type == RequirementNode) {
                    TrainingRequirementNode requirementNode = this.requirementNodeRepo
                            .getTrainingRequirementNodeByTrainingTreeNode(child);
                    if (requirementNode != null) {
                        lastAnchor = Math.toIntExact(requirementNode.getRequirementSkeleton().getId());
                        break;
                    }
                } else if (child_type == CategoryNode) {
                    TrainingCategoryNode categoryNode = this.categoryNodeRepo
                            .getTrainingCategoryNodeByTrainingTreeNode(child);
                    if (categoryNode != null) {
                        lastAnchor = Math.toIntExact(categoryNode.getCategory().getId());
                        break;
                    }
                }
            }
        }
        return lastAnchor;
    }
    
    private void recalculateChildrenSortOrder(TrainingTreeNode parent) {
        List<TrainingTreeNode> childrenNewOrder = this.reorder_children(getSeparatedChildren(parent));

        int new_sortOrder = 0;
        for (TrainingTreeNode child : childrenNewOrder) {
            child.setSort_order(new_sortOrder++);
            this.treeNodeRepo.save(child);
        }
    }
    
    private SeparatedChildren getSeparatedChildren(TrainingTreeNode parent) {
        return getSeparatedChildren(this.treeNodeRepo.getChildrenOf(parent));
    }

    private SeparatedChildren getSeparatedChildren(List<TrainingTreeNode> children) {

        TreeMap<Integer, List<TrainingTreeNode>> customNodes = new TreeMap<>(); // <anchor,list_of_nodes>
        TreeMap<Integer, List<TrainingTreeNode>> databaseNodes = new TreeMap<>(); // <showOrder,list_of_nodes>
        for (TrainingTreeNode child : children) {
            TrainingTreeNodeType child_type = child.getNode_type();
            if (child_type == CustomSlideNode) {
                Integer anchor = this.customSlideNodeRepo.getTrainingCustomSlideNodeByTrainingTreeNode(child)
                        .getAnchor();
                if (anchor == null)
                    anchor = 0;
                if (customNodes.get(anchor) == null)
                    customNodes.put(anchor, new ArrayList<>());
                customNodes.get(anchor).add(child);
            } else if (child_type == BranchNode) {
                Integer anchor = this.branchNodeRepo.getTrainingBranchNodeByTrainingTreeNode(child)
                        .getAnchor();
                if (anchor == null)
                    anchor = 0;
                if (customNodes.get(anchor) == null)
                    customNodes.put(anchor, new ArrayList<>());
                customNodes.get(anchor).add(child);
            } else if (child_type == ContentNode) {
                customNodes.get(PARENT_ANCHOR).add(child);
            } else if (child_type == CategoryNode) {
                TrainingCategoryNode categoryNode = this.categoryNodeRepo
                        .getTrainingCategoryNodeByTrainingTreeNode(child);
                child.setJson_universal_id(categoryNode.getCategory().getId());
                Integer showOrder = categoryNode.getCategory().getShowOrder();
                if(databaseNodes.get(showOrder) == null)
                    databaseNodes.put(showOrder, new ArrayList<>());
                databaseNodes.get(showOrder).add(child);
            } else if (child_type == RequirementNode) {
                TrainingRequirementNode requirementNode = this.requirementNodeRepo
                        .getTrainingRequirementNodeByTrainingTreeNode(child);
                child.setJson_universal_id(requirementNode.getRequirementSkeleton().getId());
                Integer showOrder = requirementNode.getRequirementSkeleton().getShowOrder();
                if(databaseNodes.get(showOrder) == null)
                    databaseNodes.put(showOrder, new ArrayList<>());
                databaseNodes.get(showOrder).add(child);
            } else if (child_type == GeneratedSlideNode) {
                TrainingGeneratedSlideNode generatedSlideNode = this.generatedSlideNodeRepo
                        .getTrainingGeneratedSlideNodeByTrainingTreeNode(child);
                if (generatedSlideNode.getOptColumn() == null)
                    child.setJson_universal_id(new Long(SKELETON_UNIVERSAL_ID));
                else
                    child.setJson_universal_id(generatedSlideNode.getOptColumn().getId());
                Integer showOrder = 0;
                if (generatedSlideNode.getOptColumn() != null) {
                    showOrder = generatedSlideNode.getOptColumn().getShowOrder();
                }
                if(databaseNodes.get(showOrder) == null)
                    databaseNodes.put(showOrder, new ArrayList<>());
                databaseNodes.get(showOrder).add(child);
            }
        }

        SeparatedChildren result = new SeparatedChildren();
        result.setCustomNodes(customNodes);
        result.setDatabaseNodes(databaseNodes);
        return result;
    }
    
    // finds children with given anchor and parent, sets their anchor to PARENT_ANCHOR
    private void removeAnchor(TrainingTreeNode anchoredNode) {
        TrainingTreeNodeType type = anchoredNode.getNode_type();
        if (type == CustomSlideNode) {
            TrainingCustomSlideNode customSlideNode = this.customSlideNodeRepo
                    .getTrainingCustomSlideNodeByTrainingTreeNode(anchoredNode);
            customSlideNode.setAnchor(PARENT_ANCHOR);
            this.customSlideNodeRepo.save(customSlideNode);
        } else if (type == BranchNode) {
            TrainingBranchNode branchNode = this.branchNodeRepo
                    .getTrainingBranchNodeByTrainingTreeNode(anchoredNode);
            branchNode.setAnchor(PARENT_ANCHOR);
            this.branchNodeRepo.save(branchNode);
        }
    }
    
    /*
        helper function "order_children":
        combines separate lists of a) customNodes and b) databaseNodes, which together form the complete list of children
        of their parent node
    
        expected input:
            * customNodes contains all CustomSlidesNodes and BranchNodes, mapped by their anchor
                Value-Lists don't have to be sorted
            * databaseNodes contains all Nodes with database links. The IDs must be set into their
                property 'json_universal_id'
        returns:
            * the list with children as one in new order
            * null if both input lists are null
     */

    private List<TrainingTreeNode> reorder_children(SeparatedChildren separatedChildren) {
        SortOrderComparator sortOrderComparator = new SortOrderComparator();
        if (separatedChildren.getCustomNodes() == null && separatedChildren.getDatabaseNodes() == null)
            return null;

        ArrayList<TrainingTreeNode> result = new ArrayList<>();

        List<TrainingTreeNode> parentAnchored = null;
        if (separatedChildren.getCustomNodes() != null) {
            parentAnchored = separatedChildren.getCustomNodes().get(PARENT_ANCHOR);
            if (parentAnchored != null && parentAnchored.size() > 0) {
                parentAnchored.sort(sortOrderComparator);
                for (TrainingTreeNode nextCustomNode : parentAnchored) {
                    result.add(nextCustomNode);
                }
                separatedChildren.getCustomNodes().remove(PARENT_ANCHOR);
            }
        }
        Map.Entry<Integer, List<TrainingTreeNode>> nextDatabaseNodeEntry = separatedChildren.getDatabaseNodes().firstEntry();
        while (nextDatabaseNodeEntry != null) {
            List<TrainingTreeNode> databaseNodesForShowOrder = nextDatabaseNodeEntry.getValue();
            if(databaseNodesForShowOrder != null) {
                databaseNodesForShowOrder.sort(sortOrderComparator);
                for(TrainingTreeNode databaseNode : databaseNodesForShowOrder) {
                    result.add(databaseNode);

                    // now, add custom nodes which are anchored to this node (ordered by sort_order)
                    if (separatedChildren.getCustomNodes() != null && separatedChildren.getCustomNodes().size() > 0) {
                        Long universal_id = databaseNode.getJson_universal_id();
                        if (universal_id != null) {
                            int anchor = Math.toIntExact(universal_id);
                            List<TrainingTreeNode> anchoredHere = separatedChildren.getCustomNodes().get(anchor);
                            if (anchoredHere != null && anchoredHere.size() > 0) {
                                anchoredHere.sort(sortOrderComparator);
                                for (TrainingTreeNode nextCustomNode : anchoredHere) {
                                    result.add(nextCustomNode);
                                }
                                separatedChildren.getCustomNodes().remove(anchor);
                            }
                        }
                    }
                }
            }

            separatedChildren.getDatabaseNodes().remove(nextDatabaseNodeEntry.getKey());
            nextDatabaseNodeEntry = separatedChildren.getDatabaseNodes().firstEntry();
        }
        if (separatedChildren.getCustomNodes().size() > 0) {
            List<TrainingTreeNode> invalidAnchoredNodes = new ArrayList<>();
            Map.Entry<Integer, List<TrainingTreeNode>> nextCustomNodeEntry = separatedChildren.getCustomNodes().firstEntry();
            while (nextCustomNodeEntry != null) {
                invalidAnchoredNodes.addAll(nextCustomNodeEntry.getValue());
                separatedChildren.getCustomNodes().remove(nextCustomNodeEntry.getKey());
                nextCustomNodeEntry = separatedChildren.getCustomNodes().firstEntry();
            }
            invalidAnchoredNodes.sort(new SortOrderComparator());
            result.addAll(invalidAnchoredNodes);
        }

        return result;
    }
    
    private TrainingTreeNode getSubTreeById_Real(Long id, boolean prepareContent, boolean includeIds, String parentName) {
        TrainingTreeNode result = this.treeNodeRepo.findById(id).orElse(null);

        if (result != null) {
            // add reverse relations
            switch (result.getNode_type()) {
            case CustomSlideNode:
                TrainingCustomSlideNode customSlideNode = this.customSlideNodeRepo
                        .getTrainingCustomSlideNodeByTrainingTreeNode(result);
                if (customSlideNode != null) {
                    result.setName(customSlideNode.getName());
                    result.setAnchor(customSlideNode.getAnchor());

                    String customSlideContent = customSlideNode.getContent();
                    if (prepareContent && customSlideContent != null) {
                        Training training = result.getTraining_id();
                        if (training != null && training.getName() != null)
                            customSlideContent = customSlideContent.replaceAll("(\\{{2} *training.name *}{2})",
                                    training.getName());
                        TrainingTreeNode parent = result.getParent_id();
                        if (parent != null && (parent.getName() != null || parentName != null)) {
                            String parentNameFromDb = parent.getName();
                            parentName = parentNameFromDb != null ? parentNameFromDb : parentName;
                            customSlideContent = customSlideContent.replaceAll("(\\{{2} *parent.name *}{2})",
                                    parentName);
                        }
                    }
                    result.setContent(customSlideContent);
                }
                break;
            case BranchNode:
                TrainingBranchNode branchNode = this.branchNodeRepo
                        .getTrainingBranchNodeByTrainingTreeNode(result);
                if (branchNode != null) {
                    result.setName(branchNode.getName());
                    result.setAnchor(branchNode.getAnchor());
                }
                break;
            case RequirementNode:
                TrainingRequirementNode requirementNode = this.requirementNodeRepo
                        .getTrainingRequirementNodeByTrainingTreeNode(result);
                if (requirementNode != null) {
                    Long requirement_id = requirementNode.getRequirementSkeleton().getId();
                    RequirementSkeleton requirementSkeleton = this.requirementSkeletonRepo
                            .findOneWithEagerRelationships(requirement_id);
                    result.setName(requirementSkeleton.getShortName());
                    if (includeIds)
                        result.setJson_universal_id(requirement_id);
                }
                break;
            case GeneratedSlideNode:
                TrainingGeneratedSlideNode generatedSlideNode = this.generatedSlideNodeRepo
                        .getTrainingGeneratedSlideNodeByTrainingTreeNode(result);
                if (generatedSlideNode != null) {
                    String generatedSlideName = "";
                    String generatedSlideContent = "";

                    TrainingTreeNode parent = result.getParent_id();
                    if (parent != null) {
                        TrainingRequirementNode requirementNodeOfParent = this.requirementNodeRepo
                                .getTrainingRequirementNodeByTrainingTreeNode(parent);
                        RequirementSkeleton skeleton = this.requirementSkeletonRepo
                                .findById(requirementNodeOfParent.getRequirementSkeleton().getId()).orElse(null);
                        if (skeleton != null) {
                            OptColumn optColumn = generatedSlideNode.getOptColumn();

                            if (optColumn == null) {
                                generatedSlideName = "Skeleton";
                                if (prepareContent) {
                                    generatedSlideContent = "<h2>" + skeleton.getShortName() + "</h2>"
                                            + skeleton.getDescription();
                                }
                                if (includeIds)
                                    result.setJson_universal_id(new Long(SKELETON_UNIVERSAL_ID));
                            } else {
                                generatedSlideName = optColumn.getName();
                                if (prepareContent) {
                                    List<OptColumnContent> optColumnContents = this.optColumnContentRepo
                                            .getOptColumnContentByOptColumnAndRequirement(skeleton, optColumn);
                                    if (optColumnContents != null && optColumnContents.size() > 0) {
                                        OptColumnContent optColumnContent = optColumnContents.get(0);
                                        if (optColumn != null && optColumnContent != null) {
                                            generatedSlideContent = "<h3>" + optColumn.getName() + "</h3>"
                                                    + optColumnContent.getContent();
                                        }
                                    }
                                }
                                if (includeIds)
                                    result.setJson_universal_id(generatedSlideNode.getOptColumn().getId());
                            }
                            result.setContent(generatedSlideContent);
                        }
                    }
                    result.setName(generatedSlideName);
                }
                break;
            case CategoryNode:
                TrainingCategoryNode categoryNode = this.categoryNodeRepo
                        .getTrainingCategoryNodeByTrainingTreeNode(result);
                if (categoryNode != null) {
                    Long category_id = categoryNode.getCategory().getId();
                    ReqCategory category = this.reqCategoryRepo.findById(category_id).orElse(null);
                    if (category != null) {
                        result.setName(category.getName());
                    }
                    if (includeIds)
                        result.setJson_universal_id(category_id);
                }
                break;
            case RootNode:
                result.setJson_training_id(result.getTraining_id().getId());
                break;
            case ContentNode:
                result.setName(CONTENT_NODE_NAME);
                break;
            }

            List<TrainingTreeNode> children = this.treeNodeRepo.getChildrenOf(result);
            List<TrainingTreeNode> childrenResult = new ArrayList<>();
            for (TrainingTreeNode child : children) {
                TrainingTreeNode childNode = this.getSubTreeById_Real(child.getId(), prepareContent, includeIds,
                        result.getName());
                childNode.setParent_id(result);
                childrenResult.add(childNode);
            }
            result.setChildren(childrenResult);

            return result;
        }
        return null;
    }
}
