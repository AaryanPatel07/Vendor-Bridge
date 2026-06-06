import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <svg width="120" height="40" viewBox="0 0 455 120" style={{ margin: '0 auto' }}>
              <circle cx="60" cy="60" r="30" fill="#6B4B9E" />
              <circle cx="120" cy="60" r="30" fill="#9CA3AF" />
              <circle cx="180" cy="60" r="30" fill="#D1D5DB" />
              <circle cx="240" cy="60" r="30" fill="#E5E7EB" />
            </svg>
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>VendorBridge</Typography>
            <Typography variant="subtitle1" color="text.secondary">Procurement & Vendor Management ERP</Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: '#6B4B9E', textDecoration: 'none' }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Demo credentials:
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Email: any@email.com | Password: any
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
