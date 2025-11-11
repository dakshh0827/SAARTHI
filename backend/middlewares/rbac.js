/**
 * Role-Based Access Control Middleware
 * 
 * Roles:
 * - POLICY_MAKER: Full access to all features
 * - LAB_TECHNICIAN: Can manage equipment, maintenance, view analytics
 * - USER: View-only access to dashboards and reports
 */

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Predefined role checks
const isPolicyMaker = checkRole('POLICY_MAKER');
const isLabTechnicianOrAbove = checkRole('POLICY_MAKER', 'LAB_TECHNICIAN');
const isAuthenticated = checkRole('POLICY_MAKER', 'LAB_TECHNICIAN', 'USER');

// Permission-based middleware
const can = {
  // Equipment permissions
  manageEquipment: checkRole('POLICY_MAKER', 'LAB_TECHNICIAN'),
  viewEquipment: isAuthenticated,
  
  // Maintenance permissions
  manageMaintenance: checkRole('POLICY_MAKER', 'LAB_TECHNICIAN'),
  viewMaintenance: isAuthenticated,
  
  // Analytics permissions
  viewDetailedAnalytics: checkRole('POLICY_MAKER', 'LAB_TECHNICIAN'),
  viewBasicAnalytics: isAuthenticated,
  
  // Report permissions
  generateReports: checkRole('POLICY_MAKER', 'LAB_TECHNICIAN'),
  viewReports: isAuthenticated,
  
  // Alert permissions
  manageAlerts: checkRole('POLICY_MAKER', 'LAB_TECHNICIAN'),
  viewAlerts: isAuthenticated,
  
  // User management
  manageUsers: checkRole('POLICY_MAKER'),
  
  // System configuration
  manageSystem: checkRole('POLICY_MAKER'),
};

// Data filtering based on role
const filterDataByRole = (req) => {
  const { role, institute } = req.user;
  
  const filter = {};
  
  // POLICY_MAKER can see all data
  if (role === 'POLICY_MAKER') {
    return filter;
  }
  
  // LAB_TECHNICIAN and USER can only see their institute's data
  if (institute) {
    filter.institute = institute;
  }
  
  return filter;
};

export {
  checkRole,
  isPolicyMaker,
  isLabTechnicianOrAbove,
  isAuthenticated,
  can,
  filterDataByRole,
};
