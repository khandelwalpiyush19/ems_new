import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Button, 
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { FiChevronRight } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProjects } from '../../context/employeeTaskSlice';
import { useNavigate } from 'react-router-dom';

const EmployeeProjects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { myProjects, status, error } = useSelector(state => state.employeeTask);

  useEffect(() => {
    dispatch(fetchMyProjects());
  }, [dispatch]);

  const handleProjectClick = (projectId) => {
    navigate(`/employee/projects/${projectId}`);
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 4}>
      <Typography variant="h4" gutterBottom>My Projects</Typography>
      
      {myProjects.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You are not assigned to any projects yet.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {myProjects.map(project => (
            <Paper 
              key={project._id} 
              elevation={3} 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.action.hover }
              }}
              onClick={() => handleProjectClick(project._id)}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">{project.name}</Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip 
                      label={project.status} 
                      size="small"
                      color={
                        project.status === 'Completed' ? 'success' :
                        project.status === 'In Progress' ? 'primary' :
                        project.status === 'On Hold' ? 'warning' : 'default'
                      }
                    />
                    <Typography variant="body2" color="text.secondary">
                      Leader: {project.projectLeader?.name || 'Not assigned'}
                    </Typography>
                  </Box>
                </Box>
                <FiChevronRight size={20} />
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeProjects;