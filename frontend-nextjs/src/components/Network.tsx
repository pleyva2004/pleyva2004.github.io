"use client";

import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Filter, Users } from 'lucide-react';
import { networkNodes, networkEdges, nodeColors, communities, NodeType } from '../data/network';

interface CustomNodeData {
  label: string;
  type: NodeType;
  description?: string;
  isHighlighted?: boolean;
}

const CustomNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const nodeColor = nodeColors[data.type];
  const opacity = data.isHighlighted !== undefined ? (data.isHighlighted ? 1 : 0.3) : 1;

  return (
    <div 
      className="px-3 py-2 shadow-lg rounded-lg border-2 text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105"
      style={{ 
        backgroundColor: nodeColor, 
        borderColor: nodeColor,
        color: 'white',
        opacity
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: nodeColor }} />
      <div>{data.label}</div>
      {data.description && (
        <div className="text-xs opacity-80 mt-1">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: nodeColor }} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface NetworkProps {
  isVisible: boolean;
  onClose: () => void;
}

const Network: React.FC<NetworkProps> = ({ isVisible, onClose }) => {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);

  const initialNodes: Node[] = networkNodes.map((node) => ({
    id: node.id,
    type: 'custom',
    position: { 
      x: Math.random() * 800 + 100, 
      y: Math.random() * 600 + 100 
    },
    data: { 
      label: node.label, 
      type: node.type, 
      description: node.description 
    }
  }));

  const initialEdges: Edge[] = networkEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    style: { stroke: '#374151', strokeWidth: 1 },
    type: 'smoothstep'
  }));

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const filteredData = useMemo(() => {
    let highlightedNodeIds: Set<string> = new Set();
    
    if (selectedCommunity) {
      highlightedNodeIds = new Set(communities[selectedCommunity as keyof typeof communities].nodes);
    } else if (selectedNodeType) {
      highlightedNodeIds = new Set(networkNodes.filter(n => n.type === selectedNodeType).map(n => n.id));
    }

    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted: highlightedNodeIds.size > 0 ? highlightedNodeIds.has(node.id) : undefined
      }
    }));

    const updatedEdges = edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: highlightedNodeIds.size > 0 
          ? (highlightedNodeIds.has(edge.source) && highlightedNodeIds.has(edge.target) ? 1 : 0.2)
          : 1
      }
    }));

    return { nodes: updatedNodes, edges: updatedEdges };
  }, [nodes, edges, selectedCommunity, selectedNodeType]);

  const clearFilters = () => {
    setSelectedCommunity(null);
    setSelectedNodeType(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="absolute inset-0">
        <ReactFlow
          nodes={filteredData.nodes}
          edges={filteredData.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-dark-bg"
        >
          <Background color="#1a1a1a" />
          <Controls 
            className="bg-dark-card border-dark-border"
          />
        </ReactFlow>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Professional Network</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="absolute top-16 left-4 space-y-4">
          {/* Community Filter */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Users size={16} className="mr-2" />
              Communities
            </h3>
            <div className="space-y-2">
              {Object.entries(communities).map(([key, community]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCommunity(selectedCommunity === key ? null : key)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCommunity === key 
                      ? 'bg-white/20 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: community.color }}
                    />
                    {community.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Node Type Filter */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Filter size={16} className="mr-2" />
              Categories
            </h3>
            <div className="space-y-2">
              {Object.entries(nodeColors).map(([type, color]) => (
                <button
                  key={type}
                  onClick={() => setSelectedNodeType(selectedNodeType === type ? null : type as NodeType)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors capitalize ${
                    selectedNodeType === type 
                      ? 'bg-white/20 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    />
                    {type}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(selectedCommunity || selectedNodeType) && (
            <button
              onClick={clearFilters}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;