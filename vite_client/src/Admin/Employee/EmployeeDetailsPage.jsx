import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableHead,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchEmployeeDetails, 
  updateEmployeeStatus,
  clearEmployeeDetails,
} from '../../context/employeeDetailsSlice';
import { deleteEmployee } from '../../context/employeeSlice';
import { BOTH_DOCUMENT_ENDPOINT } from '../../utils/constant';

const EmployeeDetailsPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    employee, 
    loading, 
    error,
    updatingStatus,
    statusUpdateError
  } = useSelector((state) => state.employeeDetails);

  useEffect(() => {
    dispatch(fetchEmployeeDetails(employeeId));
    
    return () => {
      dispatch(clearEmployeeDetails());
    };
  }, [dispatch, employeeId]);

  const handleStatusChangeClick = () => {
    setOpenDialog(true);
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const downloadUrl = `${BOTH_DOCUMENT_ENDPOINT}/${employeeId}/documents/${documentId}/download`;
      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleConfirmStatusChange = () => {
    dispatch(updateEmployeeStatus({
      employeeId: employee._id,
      active: !employee.active
    }));
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteEmployee(employeeId))
      .unwrap()
      .then(() => {
        navigate('/employees');
      })
      .catch((error) => {
        console.error('Error deleting employee:', error);
      });
    setOpenDeleteDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">
          {error}
          <Button onClick={() => navigate(-1)} sx={{ ml: 2 }}>Go Back</Button>
        </Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box p={2}>
        <Alert severity="warning">
          Employee not found
          <Button onClick={() => navigate(-1)} sx={{ ml: 2 }}>Go Back</Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3,
        marginLeft: { 
          xs: 0, // Mobile - no margin since sidebar becomes navbar
          sm: '20px', // Minimized sidebar (w-20)
          md: '256px' // Expanded sidebar (w-64)
        },
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: {
          xs: '100%', // Mobile - full width
          sm: 'calc(100% - 20px)', // Account for minimized sidebar
          md: 'calc(100% - 256px)' // Account for expanded sidebar
        }
      }}
    >
      <Button 
        variant="outlined" 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Employees
      </Button>

      {statusUpdateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statusUpdateError}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          {employee.name} {employee.lastName}
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          width: isMobile ? '100%' : 'auto'
        }}>
          {employee && (
            <Button
              variant="contained"
              color={employee.active ? 'success' : 'error'}
              onClick={handleStatusChangeClick}
              disabled={updatingStatus}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'small'}
            >
              {employee.active ? 'ACTIVE - CLICK TO DEACTIVATE' : 'INACTIVE - CLICK TO ACTIVATE'}
            </Button>
          )}
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'small'}
          >
            Delete Employee
          </Button>
        </Box>
      </Box>

      {/* Status Change Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen={isMobile}
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Status Change
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to change the status of {employee.name} {employee.lastName} from {employee.active ? 'Active' : 'Inactive'} to {employee.active ? 'Inactive' : 'Active'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            color={employee.active ? 'error' : 'success'} 
            autoFocus
            disabled={updatingStatus}
          >
            {updatingStatus ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen={isMobile}
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Employee Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete {employee.name} {employee.lastName}? 
            This action cannot be undone and will also delete all associated records (payroll, documents, etc.).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            autoFocus
            disabled={updatingStatus}
          >
            {updatingStatus ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rest of your component remains the same */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        flexWrap: 'wrap',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Basic Info */}
        <Paper sx={{ 
          p: 2, 
          flex: 1, 
          minWidth: isMobile ? '100%' : 300,
          overflowX: 'auto'
        }}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Email:</strong></TableCell>
                  <TableCell>{employee.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Personal Email:</strong></TableCell>
                  <TableCell>{employee.personalEmail}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Phone 1:</strong></TableCell>
                  <TableCell>{employee.phone1}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Phone 2:</strong></TableCell>
                  <TableCell>{employee.phone2}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Address:</strong></TableCell>
                  <TableCell>{employee.address}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Manager:</strong></TableCell>
                  <TableCell>{employee.manager}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Salary:</strong></TableCell>
                  <TableCell>${employee.salary?.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Job Title:</strong></TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Position:</strong></TableCell>
                  <TableCell>{employee.position}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Department:</strong></TableCell>
                  <TableCell>{employee.department}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Created At:</strong></TableCell>
                  <TableCell>{new Date(employee.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Financial Details */}
        {employee.financialDetails && (
          <Paper sx={{ 
            p: 2, 
            flex: 1, 
            minWidth: isMobile ? '100%' : 300,
            overflowX: 'auto'
          }}>
            <Typography variant="h6" gutterBottom>Financial Details</Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Bank Name:</strong></TableCell>
                    <TableCell>{employee.financialDetails.bankName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Account Name:</strong></TableCell>
                    <TableCell>{employee.financialDetails.accountName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Account Number:</strong></TableCell>
                    <TableCell>{employee.financialDetails.accountNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>IFSC Code:</strong></TableCell>
                    <TableCell>{employee.financialDetails.ifsc}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {/* Accordion sections for additional details */}
      <Box sx={{ mt: 3 }}>
        {/* Academic Records */}
        {employee.academicRecords?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Academic Records</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Institution</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.academicRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.institution}</TableCell>
                        <TableCell>{record.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Professional Qualifications */}
        {employee.professionalQualifications?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Professional Qualifications</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.professionalQualifications.map((qualification, index) => (
                      <TableRow key={index}>
                        <TableCell>{qualification.title}</TableCell>
                        <TableCell>{qualification.organization}</TableCell>
                        <TableCell>{qualification.duration}</TableCell>
                        <TableCell>{qualification.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Family Details */}
        {employee.familyDetails?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Family Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Relationship</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Occupation</TableCell>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.familyDetails.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell>{member.fullName}</TableCell>
                        <TableCell>{member.relationship}</TableCell>
                        <TableCell>{member.phoneNo}</TableCell>
                        <TableCell>{member.occupation}</TableCell>
                        <TableCell>{member.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Next of Kins */}
        {employee.nextOfKins?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Next of Kins</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Relationship</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Occupation</TableCell>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.nextOfKins.map((kin, index) => (
                      <TableRow key={index}>
                        <TableCell>{kin.name}</TableCell>
                        <TableCell>{kin.relationship}</TableCell>
                        <TableCell>{kin.phone}</TableCell>
                        <TableCell>{kin.occupation}</TableCell>
                        <TableCell>{kin.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Guarantors */}
        {employee.guarantors?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Guarantors</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Relationship</TableCell>
                      <TableCell>Occupation</TableCell>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.guarantors.map((guarantor, index) => (
                      <TableRow key={index}>
                        <TableCell>{guarantor.name}</TableCell>
                        <TableCell>{guarantor.relationship}</TableCell>
                        <TableCell>{guarantor.occupation}</TableCell>
                        <TableCell>{guarantor.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Documents */}
        {employee.documents?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Documents</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document Type</TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell>Uploaded At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.documents.map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell>{doc.documentType}</TableCell>
                        <TableCell>{doc.fileName}</TableCell>
                        <TableCell>{new Date(doc.uploadedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: 1
                          }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleDownloadDocument(doc._id, doc.fileName)}
                              fullWidth={isMobile}
                            >
                              Download
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              color="secondary"
                              onClick={() => window.open(`http://localhost:5000${doc.filePath}`, '_blank')}
                              fullWidth={isMobile}
                            >
                              View
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeDetailsPage;