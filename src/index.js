import {handleConditionNode, handleServiceNode} from "./utils";

/**
 * construct
 * 根据提供的节点及边数据，生成 Netflix Conductor（微服务编排框架）可执行的 JSON
 * @param source 资源，节点及边数据
 * @param config 配置项
 */
function construct(source, config) {
    let nodes = source.nodes;
    let edges = source.edges;

    // 中间层节点构造函数
    function MiddleLayerNode(id) {
        let node = nodes.find((item) => {
            return item.id === id;
        });
        this.id = node.id;
        this.name = node.label;
        this.description = node.description;
        this.in = [];
        this.out = [];
    };

    /**
     * 一、for of 遍历边数据，根据边的源节点与目标节点，构造一个既有当前节点数据，也有上下游节点数据的节点对象数组
     *
     * 如果存在，则 直接获取 并告诉它它的上一个节点和下一个节点是谁，记录在 in 和 out
     * 如果不存在，则 创建后 再告诉它它的上一个节点和下一个节点是谁，记录在 in 和 out
     *
     * 整个循环下来，我们可以知道所有节点的上一个节点和下一个节点是谁
     * 其中上一个节点是谁记录在in，下一个节点是谁记录在out，类似链表
     */
    let nodeMap = {};
    for (const edge of edges) {
        const sourceNodeId = edge.source;
        const targetNodeId = edge.target;
        let sourceNode = {};
        let targetNode = {};
        // 先判断集合中是否已存在当前边的源节点/目标节点
        // 存在，则直接取
        // 不存在，则实例化一个中间层节点，并放入集合中，以便后续遍历匹配时可直接取
        if (nodeMap[sourceNodeId]) {
            sourceNode = nodeMap[sourceNodeId];
        } else {
            sourceNode = new MiddleLayerNode(sourceNodeId);
            nodeMap[sourceNodeId] = sourceNode;
        }
        if (nodeMap[targetNodeId]) {
            targetNode = nodeMap[targetNodeId];
        } else {
            targetNode = new MiddleLayerNode(targetNodeId);
            nodeMap[targetNodeId] = targetNode;
        }
        // 边联系源节点和目标节点，说明源节点的下游输出是目标节点、目标节点的上游输入是源节点
        // 以此记录节点上下游，遍历结束则完成构造一个统计节点上下游的集合
        sourceNode.out.push({
            edge,
            target: targetNode
        });
        targetNode.in.push({
            edge,
            source: sourceNode
        });
    }

    /**
     * 二、寻找开始节点和结束节点
     *
     * 如果无上一节点，则说明是开始节点
     * 如果无下一节点，则说明是结束节点
     */
    let startNode = {};
    let endNode = {};
    for (let nodeId of Object.keys(nodeMap)) {
        // 开始节点（无上游输入）
        if (nodeMap[nodeId].in.length === 0) {
            startNode = nodeMap[nodeId];
        }
        // 结束节点（无下游输出）
        if (nodeMap[nodeId].out.length === 0) {
            endNode = nodeMap[nodeId];
        }
    }

    /**
     * 三、定义输出的 JSON 结构
     *
     * 当然业务中不太可能仅有以下几个，请根据业务调整。
     */
    let result = {
        // 服务名称
        name: startNode.name,
        // 服务描述
        description: startNode.description,
        // 服务版本
        version: 1,
        // 执行步骤
        steps: [],
        // 结束节点的输出参数
        outputParams: {}
    };

    /**
     * 四、递归组装
     */
    for (let nodeInfo of startNode.out) {
        // 如果下一节点的输出，只有一个，说明是普通节点，反正则说明是条件节点。
        if (nodeInfo.target.out.length === 1) {
            // 服务节点
            handleServiceNode(nodeInfo.target, result.steps);
        } else if (nodeInfo.target.out.length > 1) {
            // 条件节点
            result.steps.push(handleConditionNode(nodeInfo.target));
        }
    }
    return result;
}

// 拆解
function destruct() {
//  待补充
}

export {construct, destruct};
