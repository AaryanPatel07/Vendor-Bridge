import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth, UserRole } from '../../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('procurement_officer');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await signup(email, password, name, role);
      navigate('/');
    } catch (err) {
      setError('Signup failed. Please try again.');
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
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>Create Account</Typography>
            <Typography variant="subtitle1" color="text.secondary">Join VendorBridge</Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              variant="outlined"
            />

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

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="procurement_officer">Procurement Officer</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#6B4B9E', textDecoration: 'none' }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
