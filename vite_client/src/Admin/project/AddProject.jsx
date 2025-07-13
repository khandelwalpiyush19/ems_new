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
  Autocomplete,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployees } from '../../context/employeeSlice';
import useAddProject from '../../Hooks/useAddProject';

function AddProject() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Get employees from Redux store (simplified structure)
    const { employees, status, error: employeesError } = useSelector((state) => ({
        employees: state.employees.employees || [],
        status: state.employees.status,
        error: state.employees.error
    }));
    
    // Project submission status
    const projectStatus = useSelector((state) => state.project.status);
    const projectError = useSelector((state) => state.project.error);
    const addProject = useAddProject();

    const [form, setForm] = useState({ 
        name: '', 
        status: 'pending',
        projectLeader: [],
        projectMembers: []
    });
    
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch employees when component mounts
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchEmployees());
        }
    }, [status, dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLeaderSelect = (employeeId) => {
        if (form.projectLeader.includes(employeeId)) {
            setForm({
                ...form,
                projectLeader: form.projectLeader.filter(id => id !== employeeId)
            });
        } else {
            if (form.projectLeader.length >= 2) {
                setError('Maximum 2 leaders can be selected');
                return;
            }
            setForm({
                ...form,
                projectLeader: [...form.projectLeader, employeeId]
            });
        }
        setError('');
    };

    const handleMemberSelect = (employeeId) => {
        if (form.projectMembers.includes(employeeId)) {
            setForm({
                ...form,
                projectMembers: form.projectMembers.filter(id => id !== employeeId)
            });
        } else {
            setForm({
                ...form,
                projectMembers: [...form.projectMembers, employeeId]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!form.name) {
            setError('Project name is required');
            return;
        }

        if (form.projectLeader.length === 0) {
            setError('Please select at least one project leader');
            return;
        }

        const result = await addProject(form);

        if (result.success) {
            navigate('/dashboard-admin');
        } else {
            setError(result.error?.message || 'Failed to add project');
        }
    };

    // Helper function to get employee name by ID
    const getEmployeeName = (id) => {
        const employee = employees.find(emp => emp._id === id);
        return employee ? `${employee.name} ${employee.lastName}` : '';
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(employee => 
        `${employee.name} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed') {
        return (
            <Box p={2}>
                <Alert severity="error">
                    Error loading employees: {employeesError || 'Unknown error occurred'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box 
            sx={{ 
                padding: 4,
                // Adjust margin based on sidebar state and screen size
                marginLeft: isMobile ? 0 : '20rem', // Default to expanded sidebar
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                // You might want to add a class or state to track sidebar collapsed state
                // Here's how you would adjust it when sidebar is minimized:
                // '&.sidebar-collapsed': {
                //     marginLeft: '5rem', // w-20 equivalent
                // },
                // For mobile, no margin needed as sidebar becomes top navbar
                [theme.breakpoints.down('md')]: {
                    marginLeft: 0,
                    padding: 2
                }
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ [theme.breakpoints.down('md')]: { fontSize: '1.5rem' } }}>
                Add New Project
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {projectStatus === 'loading' && (
                <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                </Box>
            )}

            <Paper elevation={3} sx={{ 
                padding: 3,
                [theme.breakpoints.down('md')]: {
                    padding: 2
                }
            }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Project Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        margin="normal"
                        required
                        sx={{ [theme.breakpoints.down('md')]: { marginBottom: 2 } }}
                    />
                    
                    <FormControl fullWidth margin="normal" sx={{ [theme.breakpoints.down('md')]: { marginBottom: 2 } }}>
                        <InputLabel>Project Status</InputLabel>
                        <Select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            label="Project Status"
                            required
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="on-hold">On Hold</MenuItem>
                        </Select>
                    </FormControl>
                    
                    {/* Project Leaders Section */}
                    <Box mt={3} sx={{ [theme.breakpoints.down('md')]: { marginTop: 2 } }}>
                        <Typography variant="h6" gutterBottom sx={{ [theme.breakpoints.down('md')]: { fontSize: '1.1rem' } }}>
                            Project Leaders (Max 2)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {form.projectLeader.map(id => (
                                <Chip
                                    key={id}
                                    label={getEmployeeName(id)}
                                    onDelete={() => handleLeaderSelect(id)}
                                    color="primary"
                                    size={isMobile ? 'small' : 'medium'}
                                />
                            ))}
                        </Box>
                        <Autocomplete
                            multiple
                            options={filteredEmployees}
                            getOptionLabel={(employee) => `${employee.name} ${employee.lastName}`}
                            value={employees.filter(emp => form.projectLeader.includes(emp._id))}
                            onChange={(event, newValue) => {
                                if (newValue.length <= 2) {
                                    setForm({
                                        ...form,
                                        projectLeader: newValue.map(emp => emp._id)
                                    });
                                    setError('');
                                } else {
                                    setError('Maximum 2 leaders can be selected');
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search and select leaders"
                                    placeholder="Type to search employees"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size={isMobile ? 'small' : 'medium'}
                                />
                            )}
                            renderOption={(props, employee, { selected }) => (
                                <MenuItem {...props} key={employee._id}>
                                    <Checkbox checked={form.projectLeader.includes(employee._id)} size={isMobile ? 'small' : 'medium'} />
                                    <ListItemText 
                                        primary={`${employee.name} ${employee.lastName}`}
                                        secondary={`${employee.position} - ${employee.department}`}
                                        sx={{ 
                                            '& .MuiListItemText-primary': { fontSize: isMobile ? '0.875rem' : '1rem' },
                                            '& .MuiListItemText-secondary': { fontSize: isMobile ? '0.75rem' : '0.875rem' }
                                        }}
                                    />
                                </MenuItem>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((employee, index) => (
                                    <Chip
                                        {...getTagProps({ index })}
                                        key={employee._id}
                                        label={`${employee.name} ${employee.lastName}`}
                                        size={isMobile ? 'small' : 'medium'}
                                    />
                                ))
                            }
                        />
                    </Box>
                    
                    {/* Project Members Section */}
                    <Box mt={3} sx={{ [theme.breakpoints.down('md')]: { marginTop: 2 } }}>
                        <Typography variant="h6" gutterBottom sx={{ [theme.breakpoints.down('md')]: { fontSize: '1.1rem' } }}>
                            Project Members
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {form.projectMembers.map(id => (
                                <Chip
                                    key={id}
                                    label={getEmployeeName(id)}
                                    onDelete={() => handleMemberSelect(id)}
                                    color="secondary"
                                    size={isMobile ? 'small' : 'medium'}
                                />
                            ))}
                        </Box>
                        <Autocomplete
                            multiple
                            options={filteredEmployees}
                            getOptionLabel={(employee) => `${employee.name} ${employee.lastName}`}
                            value={employees.filter(emp => form.projectMembers.includes(emp._id))}
                            onChange={(event, newValue) => {
                                setForm({
                                    ...form,
                                    projectMembers: newValue.map(emp => emp._id)
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search and select members"
                                    placeholder="Type to search employees"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size={isMobile ? 'small' : 'medium'}
                                />
                            )}
                            renderOption={(props, employee, { selected }) => (
                                <MenuItem {...props} key={employee._id}>
                                    <Checkbox checked={form.projectMembers.includes(employee._id)} size={isMobile ? 'small' : 'medium'} />
                                    <ListItemText 
                                        primary={`${employee.name} ${employee.lastName}`}
                                        secondary={`${employee.position} - ${employee.department}`}
                                        sx={{ 
                                            '& .MuiListItemText-primary': { fontSize: isMobile ? '0.875rem' : '1rem' },
                                            '& .MuiListItemText-secondary': { fontSize: isMobile ? '0.75rem' : '0.875rem' }
                                        }}
                                    />
                                </MenuItem>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((employee, index) => (
                                    <Chip
                                        {...getTagProps({ index })}
                                        key={employee._id}
                                        label={`${employee.name} ${employee.lastName}`}
                                        size={isMobile ? 'small' : 'medium'}
                                    />
                                ))
                            }
                        />
                    </Box>
                    
                    <Box mt={4} display="flex" justifyContent="space-between" sx={{ 
                        [theme.breakpoints.down('md')]: { 
                            flexDirection: 'column-reverse',
                            gap: 2,
                            marginTop: 3
                        }
                    }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            type="submit"
                            disabled={projectStatus === 'loading'}
                            fullWidth={isMobile}
                            size={isMobile ? 'medium' : 'large'}
                        >
                            {projectStatus === 'loading' ? 'Saving...' : 'Save Project'}
                        </Button>
                        
                        <Button 
                            component={Link}
                            to="/dashboard-admin"
                            variant="outlined"
                            color="secondary"
                            fullWidth={isMobile}
                            size={isMobile ? 'medium' : 'large'}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

export default AddProject;