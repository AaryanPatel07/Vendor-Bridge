import { Box, Paper, Typography, Chip, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { RequestQuote, Email, CheckCircle, Receipt, Assignment } from '@mui/icons-material';
import { useData } from '../../context/DataContext';

export default function ActivityLogs() {
  const { activityLogs } = useData();

  const getIcon = (type: string) => {
    switch (type) {
      case 'rfq':
        return <RequestQuote />;
      case 'quotation':
        return <Email />;
      case 'approval':
        return <CheckCircle />;
      case 'po':
        return <Receipt />;
      case 'invoice':
        return <Assignment />;
      default:
        return <RequestQuote />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'rfq':
        return 'primary';
      case 'quotation':
        return 'secondary';
      case 'approval':
        return 'success';
      case 'po':
        return 'info';
      case 'invoice':
        return 'warning';
      default:
        return 'grey';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Activity Logs</Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" gutterBottom>
          {activityLogs.length} activity log(s)
        </Typography>

        {activityLogs.length > 0 ? (
          <List>
            {activityLogs.map((log) => (
              <ListItem key={log.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main }}>{getIcon(log.type)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2">{log.description}</Typography>}
                  secondary={
                    <>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()} • by {log.user}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body2" color="text.secondary">
              No activity logs yet
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
