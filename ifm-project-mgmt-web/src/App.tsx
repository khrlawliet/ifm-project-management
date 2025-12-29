import { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import TaskList from './components/TaskList/TaskList';
import TaskCalendar from './components/TaskCalendar/TaskCalendar';
import ProjectList from './components/ProjectList/ProjectList';
import { AppProvider } from './contexts/AppContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  // Only render children when tab is active
  if (value !== index) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      <Box sx={{ py: 3 }}>{children}</Box>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTaskChanged = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                IFM Project Management
              </Typography>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="project management tabs">
                <Tab label="Projects" />
                <Tab label="Tasks" />
                <Tab label="Calendar" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <ProjectList onProjectChanged={handleTaskChanged} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <TaskList onTaskChanged={handleTaskChanged} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <TaskCalendar refresh={refreshKey} />
            </TabPanel>
          </Container>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
