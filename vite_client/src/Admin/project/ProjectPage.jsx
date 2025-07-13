import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProjectCard from './ProjectCard';
import useGetAllProjects from '../../Hooks/useGetAllProjects';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { FiSearch, FiX } from 'react-icons/fi';

const ProjectsPage = () => {
  useGetAllProjects();
  const { allProjects, loading, error } = useSelector(store => store.project);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const filteredProjects = allProjects?.filter(project => {
    if (!debouncedSearchTerm) return true;
    return (
      project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  });

  return (
    <Box sx={{
      // Adjust margin left based on sidebar state (assuming you have a state for this)
      // For mobile, we don't need margin left as sidebar becomes top navbar
      ml: { 
        xs: '0px', // Mobile - no margin
        md: '80px' // Default minimized sidebar width
      },
      transition: 'margin-left 0.3s ease',
      width: { 
        xs: '100%', // Full width on mobile
        md: 'calc(100% - 80px)' // Account for minimized sidebar
      }
    }}>
      {/* This class would be toggled based on sidebar state */}
      <Box className="sidebar-expanded" sx={{
        ml: { md: '256px' }, // Expanded sidebar width
        width: { md: 'calc(100% - 256px)' } // Account for expanded sidebar
      }}>
        <Container maxWidth="lg" sx={{ 
          py: 4,
          px: { xs: 2, sm: 3 },
          // Reset container width to account for sidebar
          maxWidth: { 
            xs: '100%', 
            sm: '100%', 
            md: 'calc(100% - 32px)', 
            lg: 'calc(100% - 32px)' 
          }
        }}>
          {/* Header and Search */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: 'text.primary'
            }}>
              Projects
            </Typography>

            <TextField
              size="small"
              label="Search projects"
              variant="outlined"
              sx={{ 
                width: { xs: '100%', sm: 350 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch style={{ color: '#666' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setSearchTerm('')}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <FiX />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200
            }}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <Grid container spacing={3}>
              {filteredProjects?.length > 0 ? (
                filteredProjects.map(project => (
                  <Grid item xs={12} sm={6} lg={4} key={project._id}>
                    <ProjectCard project={project} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ 
                    borderRadius: 1,
                    backgroundColor: 'background.default'
                  }}>
                    {debouncedSearchTerm ? 'No projects match your search.' : 'No projects found.'}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProjectsPage;