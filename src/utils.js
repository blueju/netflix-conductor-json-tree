/**
 * 服务节点处理函数
 * @param node      节点
 * @param context   steps 上下文
 */
export function handleServiceNode(node, context) {
    let res = {
        name: node.name,
        description: node.description,
        type: "SIMPLE"
    };
    context.push(res);
    let nextNode = node.out[0].target;
    // 服务节点
    if (nextNode.out.length === 1) {
        handleServiceNode(nextNode, context);
    }
    // 条件节点
    if (nextNode.out.length > 1) {
        context.push(handleConditionNode(nextNode));
    }
}

/**
 * 条件节点处理函数
 * @param node
 */
export function handleConditionNode(node) {
    let res = {
        name: node.name,
        description: node.description,
        type: "DECISION",
        decisionCases: {}
    };
    for (let next of node.out) {
        if(next.edge.label.length===0){
            throw new Error("请检查条件节点输出边的标签文本，不得为空！")
        }
        res.decisionCases[next.edge.label] = [];
        // 服务节点
        if (next.target.out.length === 1) {
            handleServiceNode(next.target, res.decisionCases[next.edge.label]);
        }
        // 条件节点
        if (next.target.out.length > 1) {
            res.decisionCases[next.edge.label].push(handleConditionNode(next.target));
        }
    }
    return res;
}
