import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Chip, 
  CircularProgress,
  Alert,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchMyTasks, 
  createNewTask, 
  updateExistingTask 
} from '../../context/employeeTaskSlice';

const EmployeeTasks = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { myProjects, myTasks, status, error } = useSelector(state => state.employeeTask);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('Not Started');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [comments, setComments] = useState('');

  const currentProject = myProjects.find(p => p._id === projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchMyTasks({ projectId }));
    }
  }, [projectId, dispatch]);

  const handleCreateTask = async () => {
    if (!taskDescription.trim()) return;

    const taskData = {
      projectId,
      taskDescription: taskDescription.trim(),
      status: taskStatus,
      comments: comments.trim()
    };

    const result = await dispatch(createNewTask(taskData));
    if (result.payload?.success) {
      setTaskDescription('');
      setTaskStatus('Not Started');
      setComments('');
    }
  };

  const handleUpdateTask = async (taskId) => {
    if (!taskDescription.trim()) return;

    const updateData = {
      taskDescription: taskDescription.trim(),
      status: taskStatus,
      comments: comments.trim()
    };

    const result = await dispatch(updateExistingTask(taskId, updateData));
    if (result.payload?.success) {
      setEditingTaskId(null);
      setTaskDescription('');
      setTaskStatus('Not Started');
      setComments('');
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskDescription(task.taskDescription);
    setTaskStatus(task.status);
    setComments(task.comments || '');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTaskDescription('');
    setTaskStatus('Not Started');
    setComments('');
  };

  if (!currentProject) {
    return (
      <Box p={2}>
        <Alert severity="error">Project not found</Alert>
        <Button onClick={() => navigate('/employee/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 4}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button 
          onClick={() => navigate('/employee/projects')}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
        >
          Back to Projects
        </Button>
        <Typography variant="h4">{currentProject.name}</Typography>
        <Chip 
          label={currentProject.status} 
          size={isMobile ? 'small' : 'medium'}
          color={
            currentProject.status === 'Completed' ? 'success' :
            currentProject.status === 'In Progress' ? 'primary' :
            currentProject.status === 'On Hold' ? 'warning' : 'default'
          }
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Task Input Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editingTaskId ? 'Update Task' : 'Add Today\'s Task'}
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            fullWidth
            label="Task Description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            size={isMobile ? 'small' : 'medium'}
          />

          <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
            <InputLabel>Status</InputLabel>
            <Select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={3}
            size={isMobile ? 'small' : 'medium'}
          />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            {editingTaskId && (
              <Button
                onClick={handleCancelEdit}
                variant="outlined"
                color="error"
                size={isMobile ? 'small' : 'medium'}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={editingTaskId ? 
                () => handleUpdateTask(editingTaskId) : 
                handleCreateTask}
              variant="contained"
              color="primary"
              startIcon={editingTaskId ? <FiSave /> : <FiPlus />}
              size={isMobile ? 'small' : 'medium'}
              disabled={!taskDescription.trim() || status === 'loading'}
            >
              {editingTaskId ? 'Update Task' : 'Add Task'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tasks List */}
      <Typography variant="h5" gutterBottom>My Tasks</Typography>
      
      {status === 'loading' ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : myTasks.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No tasks found for this project.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {myTasks.map(task => (
            <Paper key={task._id} elevation={2} sx={{ p: 2 }}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{task.taskDescription}</Typography>
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
                
                <Typography variant="body2" color="text.secondary">
                  {new Date(task.date).toLocaleDateString()}
                </Typography>
                
                {task.comments && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {task.comments}
                  </Typography>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button
                    onClick={() => handleEditTask(task)}
                    variant="outlined"
                    size="small"
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeTasks;