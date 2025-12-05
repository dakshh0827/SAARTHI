import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  LineChart as LineChartIcon,
  Box,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Wrench,
  Building,
  Award,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

// --- Mock Components & Stores ---

// Mock LoadingSpinner
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

// --- Status Colors Map ---
const STATUS_COLORS = {
  "OPERATIONAL": "#10B981",
  "IN USE": "#3B82F6",
  "MAINTENANCE": "#f5b20b",
  "FAULTY": "#EF4444",
  "OFFLINE": "#9CA3AF"
};

const FALLBACK_COLORS = ["#8B5CF6", "#EC4899", "#14B8A6", "#6366F1", "#84CC16", "#06B6D4"];

// --- STATIC DATA FOR 15 EQUIPMENT (TEMPERATURE CHART) ---
const STATIC_EQUIPMENT_NAMES = [
  "Furnace A-1", "Furnace B-2", "CNC Mill X1", "CNC Lathe Y1", "Hydraulic Press",
  "Motor Unit 01", "Motor Unit 02", "Cooling Fan A", "Compressor Main", "Compressor Aux",
  "Welding Arm 1", "Robot Gantry", "3D Printer Pro", "Laser Cutter", "Assembly Belt"
];

const EXPANDED_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6",
  "#D946EF", "#F43F5E", "#78716C", "#14B8A6", "#1E293B"
];

const STATIC_TEMP_DATA = [
  { time: "00:00", "Furnace A-1": 45, "Furnace B-2": 42, "CNC Mill X1": 35, "CNC Lathe Y1": 36, "Hydraulic Press": 40, "Motor Unit 01": 55, "Motor Unit 02": 53, "Cooling Fan A": 30, "Compressor Main": 48, "Compressor Aux": 47, "Welding Arm 1": 38, "Robot Gantry": 34, "3D Printer Pro": 32, "Laser Cutter": 31, "Assembly Belt": 29 },
  { time: "04:00", "Furnace A-1": 48, "Furnace B-2": 44, "CNC Mill X1": 38, "CNC Lathe Y1": 39, "Hydraulic Press": 42, "Motor Unit 01": 58, "Motor Unit 02": 56, "Cooling Fan A": 32, "Compressor Main": 50, "Compressor Aux": 49, "Welding Arm 1": 40, "Robot Gantry": 36, "3D Printer Pro": 34, "Laser Cutter": 33, "Assembly Belt": 31 },
  { time: "08:00", "Furnace A-1": 65, "Furnace B-2": 60, "CNC Mill X1": 45, "CNC Lathe Y1": 46, "Hydraulic Press": 55, "Motor Unit 01": 65, "Motor Unit 02": 63, "Cooling Fan A": 40, "Compressor Main": 55, "Compressor Aux": 54, "Welding Arm 1": 45, "Robot Gantry": 42, "3D Printer Pro": 40, "Laser Cutter": 38, "Assembly Belt": 35 },
  { time: "12:00", "Furnace A-1": 85, "Furnace B-2": 78, "CNC Mill X1": 52, "CNC Lathe Y1": 53, "Hydraulic Press": 68, "Motor Unit 01": 72, "Motor Unit 02": 70, "Cooling Fan A": 45, "Compressor Main": 62, "Compressor Aux": 60, "Welding Arm 1": 55, "Robot Gantry": 48, "3D Printer Pro": 45, "Laser Cutter": 44, "Assembly Belt": 42 },
  { time: "16:00", "Furnace A-1": 82, "Furnace B-2": 75, "CNC Mill X1": 50, "CNC Lathe Y1": 51, "Hydraulic Press": 65, "Motor Unit 01": 70, "Motor Unit 02": 68, "Cooling Fan A": 44, "Compressor Main": 60, "Compressor Aux": 58, "Welding Arm 1": 52, "Robot Gantry": 46, "3D Printer Pro": 43, "Laser Cutter": 42, "Assembly Belt": 40 },
  { time: "20:00", "Furnace A-1": 60, "Furnace B-2": 55, "CNC Mill X1": 40, "CNC Lathe Y1": 41, "Hydraulic Press": 48, "Motor Unit 01": 60, "Motor Unit 02": 58, "Cooling Fan A": 35, "Compressor Main": 52, "Compressor Aux": 50, "Welding Arm 1": 42, "Robot Gantry": 38, "3D Printer Pro": 36, "Laser Cutter": 35, "Assembly Belt": 33 },
  { time: "23:59", "Furnace A-1": 50, "Furnace B-2": 45, "CNC Mill X1": 36, "CNC Lathe Y1": 37, "Hydraulic Press": 42, "Motor Unit 01": 56, "Motor Unit 02": 54, "Cooling Fan A": 31, "Compressor Main": 49, "Compressor Aux": 48, "Welding Arm 1": 39, "Robot Gantry": 35, "3D Printer Pro": 33, "Laser Cutter": 32, "Assembly Belt": 30 },
];

const getISOStandard = (department) => {
  if (!department) return null;
  const dept = department.toLowerCase();
  if (dept.includes("manufactur")) return "ISO 9001";
  if (dept.includes("electric")) return "IEC/ISO standards";
  if (dept.includes("weld")) return "ISO 3834";
  if (dept.includes("material")) return "ISO 17025";
  if (dept.includes("auto")) return "ISO 16750, ISO 26262";
  if (dept.includes("it") || dept.includes("comput")) return "ISO 27001";
  return null;
};

// --- MOCK DATA FOR LAB ---
const MOCK_LAB_DATA = {
  lab: {
    labId: "LAB-001",
    id: "internal-id-123",
    name: "Advanced Manufacturing Hub",
    department: "Manufacturing Engineering",
    institute: { name: "Institute of Technology" }
  },
  statistics: {
    totalEquipment: 45,
    avgHealthScore: 88,
    totalUptime: 1250,
    totalDowntime: 42,
    inClassEquipment: 12
  },
  equipment: STATIC_EQUIPMENT_NAMES.map((name, i) => ({
    id: `eq-${i}`,
    name: name,
    status: {
      status: i % 5 === 0 ? "MAINTENANCE" : i % 7 === 0 ? "FAULTY" : i % 3 === 0 ? "IN USE" : "OPERATIONAL",
      healthScore: Math.floor(Math.random() * (100 - 70) + 70)
    },
    analyticsParams: {
      temperature: Math.random() * 60 + 20,
      efficiency: Math.floor(Math.random() * 20 + 80),
      utilizationRate: Math.floor(Math.random() * 30 + 50),
      vibration: Math.random() * 5,
      voltage: 230 + Math.random() * 10,
      powerFactor: 0.95,
      totalUptime: 100 + i * 10,
      totalDowntime: i * 2
    }
  }))
};

const MOCK_PREDICTIVE_DATA = STATIC_EQUIPMENT_NAMES.map((name, i) => ({
  id: `eq-${i}`,
  prediction: {
    probability: Math.random() * 100,
    prediction: Math.random() > 0.8 ? 1 : 0,
    status: "Active"
  }
}));

// --- UPDATED CARD TO USE ML DATA ---
const PredictiveMaintenanceCard = ({ equipment, predictionData }) => {
  // Use ML prediction if available
  const mlProb = predictionData?.prediction?.probability || 0;
  const isMaintenancePredicted = predictionData?.prediction?.prediction === 1;

  // Determine priority based on failure probability
  let priority = "LOW";
  if (mlProb > 80) priority = "CRITICAL";
  else if (mlProb > 60) priority = "HIGH";
  else if (mlProb > 40) priority = "MEDIUM";

  // Force HIGH priority if the model explicitly flags maintenance
  if (isMaintenancePredicted && (priority === "LOW" || priority === "MEDIUM")) {
    priority = "HIGH";
  }

  const getPriorityColor = (p) => {
    switch (p) {
      case "CRITICAL": return "red";
      case "HIGH": return "orange";
      case "MEDIUM": return "yellow";
      case "LOW": return "green";
      default: return "gray";
    }
  };

  const getPriorityBg = (p) => {
    switch (p) {
      case "CRITICAL": return "bg-red-50 border-red-200";
      case "HIGH": return "bg-orange-50 border-orange-200";
      case "MEDIUM": return "bg-yellow-50 border-yellow-200";
      case "LOW": return "bg-green-50 border-green-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getPriorityBg(priority)} shadow-sm`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{equipment.name}</h4>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-xs font-bold text-${getPriorityColor(priority)}-700`}>
                Failure Prob: {(mlProb).toFixed(1)}%
             </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase bg-white border border-${getPriorityColor(priority)}-200 text-${getPriorityColor(priority)}-700`}>
          {priority}
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-black/5">
        <div className="flex items-start gap-1.5 mb-1">
           <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
           <p className="text-xs text-gray-600">
             {isMaintenancePredicted ? "Maintenance Recommended by AI" : "System functioning normally"}
           </p>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
         <span>Model Status: {predictionData?.prediction?.status || 'N/A'}</span>
      </div>
    </div>
  );
};

export default function LabAnalyticsPage() {
  const { labId } = useParams();
  const navigate = useNavigate();
  // Mocking the store locally since we can't import external stores
  const [labSummary, setLabSummary] = useState(null);
  const [labLoading, setLabLoading] = useState(true);
  
  const [labAnalytics, setLabAnalytics] = useState(null);
  const [predictiveData, setPredictiveData] = useState({}); // Stores ML data
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLabLoading(true);
        setAnalyticsLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Set Mock Data
        setLabSummary(MOCK_LAB_DATA);
        setLabAnalytics(MOCK_LAB_DATA);
        
        const predMap = {};
        MOCK_PREDICTIVE_DATA.forEach(item => {
            predMap[item.id] = item;
        });
        setPredictiveData(predMap);

      } catch (error) {
        console.error("Failed to fetch lab analytics:", error);
      } finally {
        setAnalyticsLoading(false);
        setLabLoading(false);
      }
    };

    fetchData();
  }, [labId]);

  const prepareAnalyticsData = () => {
    if (!labAnalytics || !labAnalytics.equipment) return null;

    const equipment = labAnalytics.equipment;

    const statusData = equipment.reduce((acc, eq) => {
      let status = eq.status?.status || "OFFLINE";
      status = status.toUpperCase().replace(/_/g, " ");
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    let statusChartData = Object.entries(statusData).map(([status, count]) => ({
        name: status,
        rawStatus: status,
        value: count,
    }));

    const sortOrder = { "FAULTY": 1, "MAINTENANCE": 2, "OFFLINE": 3, "IN USE": 4, "OPERATIONAL": 5 };
    statusChartData.sort((a, b) => (sortOrder[a.rawStatus] || 99) - (sortOrder[b.rawStatus] || 99));

    const healthScoreData = equipment.map((eq) => ({
      name: eq.name.substring(0, 15) + (eq.name.length > 15 ? "..." : ""),
      healthScore: eq.status?.healthScore || 0,
      efficiency: eq.analyticsParams?.efficiency || 0,
    }));

    return { statusChartData, healthScoreData };
  };

  const analyticsData = labAnalytics ? prepareAnalyticsData() : null;
  const isoStandard = getISOStandard(labAnalytics?.lab?.department);

  if (labLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {labSummary?.lab?.name || "Loading..."}
                {isoStandard && (
                   <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                     <Award className="w-3 h-3" /> {isoStandard}
                   </span>
                )}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Building className="w-3 h-3" />
                <span>{labAnalytics?.lab?.institute?.name}</span>
                <span className="text-gray-300">•</span>
                <span>{labAnalytics?.lab?.department}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full p-6 space-y-6">
        
        {/* Simple Stats */}
        {labSummary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                <Box className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{labSummary.statistics?.totalEquipment || 0}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Total Equipment</span>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {labSummary.statistics?.avgHealthScore?.toFixed(0) || 0}%
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Avg Health</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {labSummary.statistics?.totalUptime?.toFixed(0) || 0}<span className="text-sm text-gray-400 font-normal ml-0.5">h</span>
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Total Uptime</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-red-50 text-red-600 rounded-full mb-3">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {labSummary.statistics?.totalDowntime?.toFixed(0) || 0}<span className="text-sm text-gray-400 font-normal ml-0.5">h</span>
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Downtime</span>
            </div>

             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {labSummary.statistics?.inClassEquipment || 0}
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Active Now</span>
            </div>
          </div>
        )}

        {analyticsData && labAnalytics && (
          <>
            {/* Predictive Maintenance Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                   <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Predictive Maintenance Forecast</h3>
                  <p className="text-sm text-gray-500">Real-time failure probability based on live sensor telemetry.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labAnalytics.equipment
                  .filter((eq) => predictiveData[eq.id]) // Only show if we have data
                  .sort((a, b) => {
                    const probA = predictiveData[a.id]?.prediction?.probability || 0;
                    const probB = predictiveData[b.id]?.prediction?.probability || 0;
                    return probB - probA; // Descending order
                  })
                  .slice(0, 6)
                  .map((eq) => (
                    <PredictiveMaintenanceCard 
                      key={eq.id} 
                      equipment={eq} 
                      predictionData={predictiveData[eq.id]} 
                    />
                  ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChartIcon className="text-blue-500 w-5 h-5"/> Equipment Status
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.statusChartData}
                        cx="50%" cy="45%" startAngle={90} endAngle={-270}
                        outerRadius={80} labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        dataKey="value"
                      >
                        {analyticsData.statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.rawStatus] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Bar Chart */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="text-green-500 w-5 h-5"/> Health Score & Efficiency
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.healthScoreData.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="healthScore" fill="#10B981" name="Health Score" />
                      <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Temperature Trends Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <LineChartIcon className="text-orange-500 w-5 h-5"/> Equipment Temperature Trends (Last 24h - Static View)
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">High</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">Medium</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Normal</span>
                  </span>
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={STATIC_TEMP_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 11 }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                      domain={[0, 120]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                      formatter={(value) => [`${value.toFixed(1)}°C`, '']}
                      itemStyle={{ fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    {STATIC_EQUIPMENT_NAMES.map((name, index) => (
                      <Line 
                        key={name}
                        type="monotone" 
                        dataKey={name} 
                        stroke={EXPANDED_COLORS[index % EXPANDED_COLORS.length]} 
                        strokeWidth={2}
                        name={name}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Equipment Detail View</h3>
              </div>
               <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Health</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Temp</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Failure Prob.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {labAnalytics.equipment.map((eq) => {
                      const pred = predictiveData[eq.id] || {};
                      const prob = pred?.prediction?.probability || 0;
                      
                      return (
                        <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{eq.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-100 text-gray-800`}>
                              {eq.status?.status || "OFFLINE"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {eq.status?.healthScore?.toFixed(0) || 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                             {eq.analyticsParams?.temperature?.toFixed(1) || "N/A"}°C
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {pred.prediction ? (
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${prob > 60 ? 'text-red-600' : 'text-green-700'}`}>
                                  {prob.toFixed(1)}%
                                </span>
                              </div>
                            ) : (<span className="text-xs text-gray-400">Loading...</span>)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}