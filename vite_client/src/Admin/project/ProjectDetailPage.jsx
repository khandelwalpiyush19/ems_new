import React, { useState, useEffect } from 'react';
import { 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Checkbox,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiEdit2, FiTrash2, FiSave, FiX, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUpdateProject from '../../Hooks/useUpdateProject';
import useDeleteProject from '../../Hooks/useDeleteProject';
import { fetchEmployees } from '../../context/employeeSlice';
import useGetAllProjects from '../../Hooks/useGetAllProjects';
import { fetchProjectTasks } from '../../context/projectSlice';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  useGetAllProjects();
  
  // Project data
  const project = useSelector(store => 
    store.project?.allProjects?.find(p => p._id === id)
  );
  
  // Project tasks data
  const { projectTasks, status, error: tasksError } = useSelector((state) => ({
    projectTasks: state.project.projectTasks || [],
    status: state.project.status,
    error: state.project.error
  }));
  
  // Employees data
  const { employees, status: employeesStatus, error: employeesError } = useSelector((state) => ({
    employees: state.employees.employees || [],
    status: state.employees.status,
    error: state.employees.error
  }));
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editedProject, setEditedProject] = useState({
    name: '',
    status: '',
    projectLeader: '',
    projectMembers: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  // Initialize data and fetch employees
  useEffect(() => {
    if (project) {
      setEditedProject({
        name: project.name,
        status: project.status,
        projectLeader: project.projectLeader?._id || '',
        projectMembers: project.projectMembers?.map(m => m._id) || []
      });
      dispatch(fetchProjectTasks(project._id));
    }
    
    if (employeesStatus === 'idle') {
      dispatch(fetchEmployees());
    }
  }, [project, employeesStatus, dispatch]);

  if (!project) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Project not found</Typography>
      </Box>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (employeeId) => {
    setEditedProject(prev => {
      const currentMembers = [...prev.projectMembers];
      const index = currentMembers.indexOf(employeeId);
      
      if (index === -1) {
        return {
          ...prev,
          projectMembers: [...currentMembers, employeeId]
        };
      } else {
        return {
          ...prev,
          projectMembers: currentMembers.filter(id => id !== employeeId)
        };
      }
    });
  };

  const handleBackToProject = () => {
    navigate('/projects', { replace: true });
    useGetAllProjects();
  }

  const handleUpdate = async () => {
    try {
      const projectData = {
        name: editedProject.name,
        status: editedProject.status,
        projectLeader: editedProject.projectLeader,
        projectMembers: editedProject.projectMembers
      };

      const result = await updateProject(project._id, projectData);
      if (result.success) {
        toast.success('Project updated successfully!');
        setIsEditing(false);
      } else {
        console.log(error)
        toast.error(result.message || 'Project updated');
      }
    } catch (error) {
      toast.error('An error occurred while updating the project');
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const result = await deleteProject(project._id);
        if (result.success) {
          toast.success('Project deleted successfully!');
          navigate('/projects', { replace: true });
        } else {
          toast.error(result.message || 'Failed to delete project');
        }
      } catch (error) {
        toast.error('An error occurred while deleting the project');
        console.error('Delete error:', error);
      }
    }
  };

  const getEmployeeName = (employee) => {
    return `${employee.name}`;
  };

  const getEmployeeById = (id) => {
    return employees.find(emp => emp._id === id);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box 
      sx={{ 
        padding: isMobile ? 2 : 4,
        marginLeft: isMobile ? 0 : '16rem',
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'} 
        justifyContent="space-between" 
        alignItems={isMobile ? 'flex-start' : 'center'} 
        gap={2}
        mb={4}
      >
        <Button 
          onClick={() => navigate('/projects')}
          startIcon={<FiChevronLeft />}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
        >
          Back to Projects
        </Button>
        
        <Box display="flex" gap={2}>
          {!isEditing ? (
            <>
              <Button 
                onClick={() => setIsEditing(true)}
                startIcon={<FiEdit2 />}
                variant="contained"
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? 'Edit' : 'Edit Project'}
              </Button>
              <Button 
                onClick={handleDelete}
                startIcon={<FiTrash2 />}
                variant="contained"
                color="error"
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? 'Delete' : 'Delete Project'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleUpdate}
                startIcon={<FiSave />}
                variant="contained"
                color="success"
                size={isMobile ? 'small' : 'medium'}
              >
                Save
              </Button>
              <Button 
                onClick={() => setIsEditing(false)}
                startIcon={<FiX />}
                variant="outlined"
                color="secondary"
                size={isMobile ? 'small' : 'medium'}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Project Details" />
        <Tab label="Team Tasks" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {isEditing ? (
            <Paper elevation={3} sx={{ padding: isMobile ? 2 : 3, mb: 4 }}>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={editedProject.name}
                  onChange={handleInputChange}
                  required
                  size={isMobile ? 'small' : 'medium'}
                />
                
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editedProject.status}
                    onChange={handleInputChange}
                    label="Status"
                    required
                  >
                    <MenuItem value="Not Started">Not Started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Project Leader</InputLabel>
                  <Select
                    name="projectLeader"
                    value={editedProject.projectLeader}
                    onChange={handleInputChange}
                    label="Project Leader"
                    required
                  >
                    {employees.map(employee => (
                      <MenuItem key={employee._id} value={employee._id}>
                        {getEmployeeName(employee)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Project Members</InputLabel>
                  <Select
                    multiple
                    name="projectMembers"
                    value={editedProject.projectMembers}
                    onChange={(e) => {
                      setEditedProject(prev => ({
                        ...prev,
                        projectMembers: e.target.value
                      }));
                    }}
                    label="Project Members"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((employeeId) => {
                          const employee = getEmployeeById(employeeId);
                          return employee ? (
                            <Chip 
                              key={employeeId} 
                              label={getEmployeeName(employee)} 
                              size={isMobile ? 'small' : 'medium'}
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee._id} value={employee._id}>
                        <Checkbox 
                          checked={editedProject.projectMembers.indexOf(employee._id) > -1} 
                          size={isMobile ? 'small' : 'medium'}
                        />
                        <ListItemText 
                          primary={getEmployeeName(employee)} 
                          primaryTypographyProps={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ padding: isMobile ? 2 : 3, mb: 4 }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>{project.name}</Typography>
              
              <Box 
                display="flex" 
                flexDirection={isMobile ? 'column' : 'row'} 
                gap={isMobile ? 2 : 4} 
                mb={3}
              >
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">Status</Typography>
                  <Chip 
                    label={project.status} 
                    color={
                      project.status === 'Completed' ? 'success' :
                      project.status === 'In Progress' ? 'primary' :
                      project.status === 'On Hold' ? 'warning' : 'default'
                    }
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">Manager</Typography>
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    {project.projectLeader ? getEmployeeName(project.projectLeader) : 'Not assigned'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">Start Date</Typography>
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>Team Members</Typography>
              {project.projectMembers?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {project.projectMembers.map((member) => (
                    <Chip
                      key={member._id}
                      label={getEmployeeName(member)}
                      color="secondary"
                      variant="outlined"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No team members assigned</Typography>
              )}
            </Paper>
          )}
        </>
      )}

      {tabValue === 1 && (
        <Paper elevation={3} sx={{ padding: isMobile ? 2 : 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Project Tasks</Typography>
          
          {status === 'loading' ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : tasksError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {tasksError}
            </Alert>
          ) : projectTasks.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No tasks found for this project.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {projectTasks.map(task => (
                <Paper key={task._id} elevation={2} sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">{task.taskDescription}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.employee?.name} • {new Date(task.date).toLocaleDateString()}
                      </Typography>
                      {task.comments && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          {task.comments}
                        </Typography>
                      )}
                    </Box>
                    <Chip 
                      label={task.status} 
                      size="small"
                      color={
                        task.status === 'Completed' ? 'success' :
                        task.status === 'In Progress' ? 'primary' :
                        task.status === 'On Hold' ? 'warning' : 'default'
                      }
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ProjectDetailPage;