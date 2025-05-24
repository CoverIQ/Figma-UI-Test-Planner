import { NodeTypes } from 'reactflow';
import FeatureInputNode from './FeatureInputNode';
import FeatureDataNode from './FeatureDataNode';

export const nodeTypes: NodeTypes = {
  featureInput: FeatureInputNode,
  featureData: FeatureDataNode,
}; 