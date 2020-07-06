import {construct} from '../src/index'
import {onlyOneServiceNode as onlyOneServiceNodeForInputValue} from "../mock/onlyOneServiceNode/inputValue";
import {onlyOneServiceNode as onlyOneServiceNodeForExpectedValue} from "../mock/onlyOneServiceNode/expectedValue";

describe('测试 construct 方法是否正确', () => {
    test('构建只有一个服务节点的JSON', () => {
        expect(construct(onlyOneServiceNodeForInputValue)).toEqual(onlyOneServiceNodeForExpectedValue);
    })
})
