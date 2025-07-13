// ForgotPasswordEmail.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, resetForgotPasswordState } from '../context/forgotPasswordSlice.js';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, TextField, Box, Typography, Container, Paper } from '@mui/material';

const ForgotPasswordEmail = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error, message } = useSelector((state) => state.forgotPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(requestPasswordReset(email));
  };

  const handleBackToLogin = () => {
    dispatch(resetForgotPasswordState());
    navigate('/login');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Forgot Password
          </Typography>
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {!success ? (
            <>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleBackToLogin}
            >
              Back to Login
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordEmail;