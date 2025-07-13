import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Box,
  Alert,
  TextField,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees } from '../../context/employeeSlice';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, status, error } = useSelector((state) => state.employees);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Debounce the search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const handleRowClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  // Sort employees by createdAt date (newest first)
  const sortedEmployees = [...(employees || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA; // Newest first
  });

  // Filter employees based on debounced search term
  const filteredEmployees = sortedEmployees.filter(employee => {
    if (!debouncedSearchTerm) return true;
    const fullName = `${employee.name} ${employee.lastName}`.toLowerCase();
    return fullName.includes(debouncedSearchTerm.toLowerCase());
  });

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
          Error loading employees: {error || 'Unknown error occurred'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{
        p: isMobile ? 2 : 3,
        ml: isMobile ? 0 : isTablet ? '80px' : '256px',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: isMobile ? '100%' : `calc(100% - ${isTablet ? '80px' : '256px'})`
      }}
    >
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'} 
        justifyContent="space-between" 
        alignItems={isMobile ? 'flex-start' : 'center'} 
        mb={3}
        gap={2}
      >
        <h1 style={{ 
          fontSize: isMobile ? '1.5rem' : '1.8rem', 
          fontWeight: 'bold',
          margin: 0
        }}>
          Employees
        </h1>
        <TextField
          label="Search employees"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            width: isMobile ? '100%' : 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            }
          }}
          size={isMobile ? 'small' : 'medium'}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            endAdornment: searchTerm && (
              <IconButton 
                onClick={() => setSearchTerm('')}
                size="small"
              >
                <ClearIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      
      <TableContainer 
        component={Paper}
        sx={{
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflowX: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Job Title</TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ display: isTablet ? 'none' : 'table-cell' }}>Position</TableCell>
                  <TableCell sx={{ display: isTablet ? 'none' : 'table-cell' }}>Department</TableCell>
                </>
              )}
              <TableCell>Status</TableCell>
              {isDesktop && <TableCell>Date Added</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee._id} 
                  hover 
                  onClick={() => handleRowClick(employee._id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {employee.name} {employee.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ display: isTablet ? 'none' : 'table-cell' }}>{employee.position}</TableCell>
                      <TableCell sx={{ display: isTablet ? 'none' : 'table-cell' }}>{employee.department}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Chip 
                      label={employee.active ? 'Active' : 'Inactive'} 
                      color={employee.active ? 'success' : 'error'} 
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  {isDesktop && (
                    <TableCell>
                      {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={isMobile ? 3 : (isTablet ? 3 : (isDesktop ? 6 : 5))} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  {debouncedSearchTerm ? 
                    'No employees match your search' : 
                    'No employees found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeesPage;