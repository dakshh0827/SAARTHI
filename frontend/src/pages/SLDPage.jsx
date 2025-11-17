/*
 * =====================================================
 * frontend/src/pages/SLDPage.jsx (UPDATED)
 * =====================================================
 */
import { useEffect, useState, useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuthStore } from "../stores/authStore";
import { useLabStore } from "../stores/labStore";
import { useEquipmentStore } from "../stores/equipmentStore";
import { useInstituteStore } from "../stores/instituteStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EquipmentNodeComponent from "../components/sld/EquipmentNode";
import { Filter, AlertCircle } from "lucide-react";

const DEPARTMENT_DISPLAY_NAMES = {
  FITTER_MANUFACTURING: "Fitter/Manufacturing",
  ELECTRICAL_ENGINEERING: "Electrical Engineering",
  WELDING_FABRICATION: "Welding & Fabrication",
  TOOL_DIE_MAKING: "Tool & Die Making",
  ADDITIVE_MANUFACTURING: "Additive Manufacturing",
  SOLAR_INSTALLER_PV: "Solar Installer (PV)",
  MATERIAL_TESTING_QUALITY: "Material Testing/Quality",
  ADVANCED_MANUFACTURING_CNC: "Advanced Manufacturing/CNC",
  AUTOMOTIVE_MECHANIC: "Automotive/Mechanic",
};

const STATUS_COLORS = {
  OPERATIONAL: "bg-green-500",
  IN_USE: "bg-blue-500",
  IN_CLASS: "bg-purple-500",
  IDLE: "bg-gray-400",
  MAINTENANCE: "bg-yellow-500",
  FAULTY: "bg-red-500",
  OFFLINE: "bg-gray-600",
  WARNING: "bg-orange-500",
};

// Custom node types for ReactFlow
const nodeTypes = {
  equipment: EquipmentNodeComponent,
};

export default function SLDPage() {
  const { user } = useAuthStore();
  const { labs, fetchLabs, isLoading: labsLoading } = useLabStore();
  const { equipment, fetchEquipment, isLoading: equipmentLoading } = useEquipmentStore();
  const { institutes, fetchInstitutes, isLoading: institutesLoading } = useInstituteStore();

  // Filter states
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLab, setSelectedLab] = useState("all");
  const [layoutType, setLayoutType] = useState("hierarchical"); // hierarchical, grid, radial

  // ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user.role === "POLICY_MAKER") {
          await fetchInstitutes();
        }
        await fetchLabs();
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // Filter logic based on user role
  const availableInstitutes = useMemo(() => {
    if (user.role === "POLICY_MAKER") {
      return institutes;
    } else if (user.role === "LAB_MANAGER") {
      return institutes.filter(inst => inst.instituteId === user.instituteId);
    }
    return [];
  }, [institutes, user]);

  const availableDepartments = useMemo(() => {
    if (user.role === "LAB_MANAGER") {
      return [user.department];
    }
    
    let filteredLabs = labs;
    if (selectedInstitute !== "all") {
      filteredLabs = labs.filter(lab => lab.instituteId === selectedInstitute);
    }
    return [...new Set(filteredLabs.map(lab => lab.department))].sort();
  }, [labs, selectedInstitute, user]);

  const availableLabs = useMemo(() => {
    let filteredLabs = labs;

    if (user.role === "LAB_MANAGER") {
      filteredLabs = labs.filter(
        lab => lab.instituteId === user.instituteId && lab.department === user.department
      );
    } else {
      if (selectedInstitute !== "all") {
        filteredLabs = filteredLabs.filter(lab => lab.instituteId === selectedInstitute);
      }
      if (selectedDepartment !== "all") {
        filteredLabs = filteredLabs.filter(lab => lab.department === selectedDepartment);
      }
    }

    return filteredLabs;
  }, [labs, selectedInstitute, selectedDepartment, user]);

  const selectedLabData = useMemo(() => {
    if (selectedLab === "all") return null;
    return availableLabs.find(lab => lab.labId === selectedLab);
  }, [selectedLab, availableLabs]);

  // Fetch equipment when lab changes
  useEffect(() => {
    if (selectedLab !== "all") {
      fetchEquipment({ labId: selectedLab });
    }
  }, [selectedLab]);

  // Generate ReactFlow nodes and edges from equipment data
  useEffect(() => {
    if (!selectedLabData || equipment.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes = [];
    const newEdges = [];

    // Main Lab Header Node
    const headerNode = {
      id: 'lab-header',
      type: 'default',
      position: { x: 400, y: 50 },
      data: {
        label: (
          <div className="text-center p-4">
            <div className="text-xl font-bold text-blue-900">{selectedLabData.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {selectedLabData.institute?.name || ""}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {DEPARTMENT_DISPLAY_NAMES[selectedLabData.department] || ""}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total Equipment: {equipment.length}
            </div>
          </div>
        ),
      },
      style: {
        background: '#EFF6FF',
        border: '3px solid #2563EB',
        borderRadius: '12px',
        width: 300,
        fontSize: '14px',
      },
    };
    newNodes.push(headerNode);

    // Layout equipment nodes based on selected layout type
    let equipmentNodes;
    
    if (layoutType === "hierarchical") {
      // Hierarchical layout - rows of equipment
      const itemsPerRow = 4;
      equipmentNodes = equipment.map((eq, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        const x = 200 + col * 300;
        const y = 250 + row * 300;

        return {
          id: eq.id,
          type: 'equipment',
          position: { x, y },
          data: { equipment: eq },
        };
      });
    } else if (layoutType === "grid") {
      // Grid layout - evenly spaced
      const cols = Math.ceil(Math.sqrt(equipment.length));
      equipmentNodes = equipment.map((eq, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = 150 + col * 280;
        const y = 250 + row * 300;

        return {
          id: eq.id,
          type: 'equipment',
          position: { x, y },
          data: { equipment: eq },
        };
      });
    } else {
      // Radial layout - equipment arranged in a circle
      const radius = 400;
      const centerX = 500;
      const centerY = 400;
      equipmentNodes = equipment.map((eq, index) => {
        const angle = (index / equipment.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle) - 125;
        const y = centerY + radius * Math.sin(angle) - 100;

        return {
          id: eq.id,
          type: 'equipment',
          position: { x, y },
          data: { equipment: eq },
        };
      });
    }

    newNodes.push(...equipmentNodes);

    // Create edges from header to all equipment
    equipment.forEach((eq) => {
      newEdges.push({
        id: `edge-header-${eq.id}`,
        source: 'lab-header',
        target: eq.id,
        type: 'smoothstep',
        animated: eq.status?.status === 'IN_USE' || eq.status?.status === 'IN_CLASS',
        style: {
          stroke: getEdgeColor(eq.status?.status),
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeColor(eq.status?.status),
        },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [equipment, selectedLabData, layoutType]);

  const getEdgeColor = (status) => {
    switch (status) {
      case 'OPERATIONAL': return '#10B981';
      case 'IN_USE': return '#3B82F6';
      case 'IN_CLASS': return '#8B5CF6';
      case 'MAINTENANCE': return '#F59E0B';
      case 'FAULTY': return '#EF4444';
      case 'WARNING': return '#F97316';
      default: return '#9CA3AF';
    }
  };

  const handleInstituteChange = (e) => {
    setSelectedInstitute(e.target.value);
    setSelectedDepartment("all");
    setSelectedLab("all");
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedLab("all");
  };

  const handleLabChange = (e) => {
    setSelectedLab(e.target.value);
  };

  const isLoading = labsLoading || equipmentLoading || institutesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Single Line Diagram (SLD)
        </h1>
        <p className="text-gray-600 mt-1">
          Visual representation of equipment layout and status in labs
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Select Lab & Layout</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Institute Filter (Only for Policy Maker) */}
          {user.role === "POLICY_MAKER" && (
            <select
              value={selectedInstitute}
              onChange={handleInstituteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="all">All Institutes</option>
              {availableInstitutes.map((inst) => (
                <option key={inst.id} value={inst.instituteId}>
                  {inst.name}
                </option>
              ))}
            </select>
          )}

          {/* Department Filter (Only for Policy Maker) */}
          {user.role === "POLICY_MAKER" && (
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || availableDepartments.length === 0}
            >
              <option value="all">All Departments</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {DEPARTMENT_DISPLAY_NAMES[dept] || dept}
                </option>
              ))}
            </select>
          )}

          {/* Lab Filter */}
          <select
            value={selectedLab}
            onChange={handleLabChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || availableLabs.length === 0}
          >
            <option value="all">Select a Lab</option>
            {availableLabs.map((lab) => (
              <option key={lab.labId} value={lab.labId}>
                {lab.name} ({lab.labId})
              </option>
            ))}
          </select>

          {/* Layout Type */}
          <select
            value={layoutType}
            onChange={(e) => setLayoutType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={selectedLab === "all"}
          >
            <option value="hierarchical">Hierarchical Layout</option>
            <option value="grid">Grid Layout</option>
            <option value="radial">Radial Layout</option>
          </select>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_COLORS).map(([status, colorClass]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${colorClass}`}></div>
              <span className="text-sm text-gray-700">
                {status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SLD Diagram */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center h-[600px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedLab === "all" ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
            <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg">Please select a lab to view equipment layout</p>
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
            <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg">No equipment found in this lab</p>
          </div>
        ) : (
          <div style={{ height: '600px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
              <Background color="#e5e7eb" gap={16} />
              <Controls />
              <MiniMap 
                nodeColor={(node) => {
                  if (node.id === 'lab-header') return '#2563EB';
                  const status = node.data?.equipment?.status?.status;
                  return getEdgeColor(status);
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
            </ReactFlow>
          </div>
        )}
      </div>
    </div>
  );
}