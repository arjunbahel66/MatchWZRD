import React, { useState, useMemo, useEffect } from 'react';
import { Container, Typography, Paper, Button, Grid, Box, Alert, CircularProgress, TextField, InputAdornment, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const FileUploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #cccccc',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PreferencesPage = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newRow, setNewRow] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [columnOrder, setColumnOrder] = useState([]);

  // Filter data based on search text
  const handleSearch = (event) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
    
    if (!uploadedData) return;
    
    if (!searchValue.trim()) {
      setFilteredData(uploadedData);
      return;
    }
    
    const filtered = uploadedData.filter(row => {
      return Object.values(row).some(value => 
        value !== null && 
        value !== undefined && 
        String(value).toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    
    setFilteredData(filtered);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchText('');
    setFilteredData(uploadedData);
  };

  // Use memoized data for the grid
  const gridData = useMemo(() => {
    return searchText ? filteredData : uploadedData;
  }, [searchText, filteredData, uploadedData]);

  // Reset selection when data changes
  useEffect(() => {
    if (uploadedData) {
      setSelectedRows([]);
    }
  }, [uploadedData]);

  // Handle delete selected rows
  const handleDeleteRows = () => {
    if (selectedRows.length === 0) return;
    
    // Create a new array without the selected rows
    const updatedData = uploadedData.filter(row => !selectedRows.includes(row.id));
    
    // Update both the main data and filtered data
    setUploadedData(updatedData);
    setFilteredData(updatedData);
    setSelectedRows([]);
    
    setUploadStatus({
      type: 'success',
      message: `${selectedRows.length} row(s) deleted successfully.`
    });
  };

  // Handle add new row
  const handleAddRow = () => {
    if (!uploadedData || uploadedData.length === 0) return;
    
    // Create a new row with default values based on the first row's structure
    const firstRow = uploadedData[0];
    const newRowData = {};
    
    Object.keys(firstRow).forEach(key => {
      if (key === 'id') {
        // Generate a new ID (max id + 1)
        const maxId = Math.max(...uploadedData.map(row => row.id));
        newRowData[key] = maxId + 1;
      } else {
        // Set default values based on the column type
        newRowData[key] = '';
      }
    });
    
    setNewRow(newRowData);
    setOpenAddDialog(true);
  };

  // Handle save new row
  const handleSaveNewRow = () => {
    const updatedData = [...uploadedData, newRow];
    setUploadedData(updatedData);
    setFilteredData(updatedData);
    setOpenAddDialog(false);
    
    setUploadStatus({
      type: 'success',
      message: 'New row added successfully.'
    });
  };

  // Handle edit row
  const handleEditRow = (row) => {
    setEditingRow(row);
    setOpenEditDialog(true);
  };

  // Handle save edited row
  const handleSaveEditedRow = () => {
    if (!editingRow) return;
    
    const updatedData = uploadedData.map(row => 
      row.id === editingRow.id ? editingRow : row
    );
    
    setUploadedData(updatedData);
    setFilteredData(updatedData);
    setOpenEditDialog(false);
    
    setUploadStatus({
      type: 'success',
      message: 'Row updated successfully.'
    });
  };

  // Handle cell edit
  const handleCellEdit = async (params) => {
    const { id, field, value } = params;
    
    const updatedData = uploadedData.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    
    setUploadedData(updatedData);
    setFilteredData(updatedData);

    // Save changes to database immediately
    try {
      const response = await axios.post('/api/preferences/save', {
        data: updatedData
      });
      
      if (response.data.success) {
        setUploadStatus({
          type: 'success',
          message: 'Changes saved successfully.'
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.error || 'Failed to save changes.'
        });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error saving changes.'
      });
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setUploadStatus(null);
    
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post('/api/preferences/import', formData);
      
      if (response.data.success) {
        // Store the column order from the backend response
        if (response.data.columnOrder && response.data.columnOrder.length > 0) {
          setColumnOrder(response.data.columnOrder);
        }
        
        setUploadedData(response.data.data);
        setFilteredData(response.data.data);
        setUploadStatus({
          type: 'success',
          message: 'File processed successfully! Review the data below.'
        });
      } else {
        throw new Error(response.data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({
        type: 'error',
        message: error.message || 'Error processing file. Please check the format and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleProcess = async () => {
    if (!uploadedData) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload data first.'
      });
      return;
    }

    try {
      const response = await axios.post('/api/process-preferences', {
        data: uploadedData
      });

      if (response.data.success) {
        setUploadStatus({
          type: 'success',
          message: 'Data processed successfully!'
        });
      } else {
        throw new Error(response.data.error || 'Processing failed');
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.message
      });
    }
  };

  // Generate form fields for add/edit dialogs
  const generateFormFields = (row, isEdit = false) => {
    if (!row || Object.keys(row).length === 0) return null;
    
    return Object.keys(row).filter(key => key !== 'id').map(key => (
      <TextField
        key={key}
        margin="dense"
        label={key}
        fullWidth
        variant="outlined"
        value={isEdit ? editingRow[key] : newRow[key] || ''}
        onChange={(e) => {
          if (isEdit) {
            setEditingRow({ ...editingRow, [key]: e.target.value });
          } else {
            setNewRow({ ...newRow, [key]: e.target.value });
          }
        }}
        sx={{ mb: 2 }}
      />
    ));
  };

  // Add a function to load data from the database
  const loadDataFromDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/preferences/load');
      
      if (response.data.success) {
        if (response.data.data.length > 0) {
          setUploadedData(response.data.data);
          setFilteredData(response.data.data);
          setColumnOrder(response.data.columnOrder);
          setUploadStatus({
            type: 'success',
            message: 'Data loaded from database successfully.'
          });
        } else {
          setUploadStatus({
            type: 'info',
            message: 'No data found in database. Please upload a preferences file.'
          });
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.error || 'Failed to load data from database.'
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error loading data from database.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to save data to the database
  const saveDataToDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/preferences/save', {
        data: uploadedData
      });
      
      if (response.data.success) {
        setUploadStatus({
          type: 'success',
          message: response.data.message || 'Preferences saved successfully.'
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.error || 'Failed to save preferences.'
        });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error saving preferences.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to clear data from the database
  const clearDataFromDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/preferences/clear');
      
      if (response.data.success) {
        setUploadedData(null);
        setFilteredData(null);
        setColumnOrder([]);
        setUploadStatus({
          type: 'success',
          message: response.data.message || 'Preferences data cleared successfully.'
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.error || 'Failed to clear preferences data.'
        });
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error clearing preferences data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data from database when component mounts
  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Student Preferences
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={loadDataFromDatabase}
              startIcon={<RefreshIcon />}
            >
              Refresh Data
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={saveDataToDatabase}
              disabled={!uploadedData || uploadedData.length === 0}
            >
              Save Preferences
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={clearDataFromDatabase}
              disabled={!uploadedData || uploadedData.length === 0}
            >
              Clear Database
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleProcess}
              disabled={!uploadedData}
            >
              Process Preferences
            </Button>
          </Box>
        </Box>
        <Typography paragraph color="text.secondary" sx={{ mb: 4 }}>
          Import Excel sheets with student preference data. You can edit the data in the table below.
          Click on any cell to edit its value. Click "Save Preferences" to persist your changes to the database.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box 
              {...getRootProps()} 
              sx={{
                border: '2px dashed #cccccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                bgcolor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                '&:hover': {
                  bgcolor: isLoading ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <input {...getInputProps()} disabled={isLoading} />
              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body1">Processing file...</Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    {isDragActive ? 'Drop the file here' : 'Drag and drop an Excel or CSV file here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted formats: .xlsx, .xls, .csv
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          {file && (
            <Grid item xs={12}>
              <Typography variant="body2">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            </Grid>
          )}

          {uploadStatus && (
            <Grid item xs={12}>
              <Alert severity={uploadStatus.type}>
                {uploadStatus.message}
              </Alert>
            </Grid>
          )}

          {uploadedData && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    variant="outlined"
                    placeholder="Search across all columns..."
                    value={searchText}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchText && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 300 }}
                  />
                  <Tooltip title="Filter data">
                    <Button 
                      variant="outlined" 
                      startIcon={<FilterListIcon />}
                      size="small"
                    >
                      Filter
                    </Button>
                  </Tooltip>
                  <Tooltip title="Sort data">
                    <Button 
                      variant="outlined" 
                      startIcon={<SortIcon />}
                      size="small"
                    >
                      Sort
                    </Button>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Add new row">
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddRow}
                    >
                      Add Row
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete selected rows">
                    <Button 
                      variant="contained" 
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteRows}
                      disabled={selectedRows.length === 0}
                    >
                      Delete ({selectedRows.length})
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              <Paper elevation={2} sx={{ p: 2, height: 600, width: '100%', overflow: 'auto' }}>
                <DataGrid
                  rows={gridData || []}
                  columns={columnOrder.length > 0 
                    ? columnOrder.map((key) => ({
                        field: key,
                        headerName: key,
                        width: key.toLowerCase().includes('email') ? 200 : 180,
                        editable: true,
                        headerClassName: 'column-header',
                        renderCell: (params) => {
                          const value = params.value;
                          return <div style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>{value}</div>;
                        }
                      }))
                    : Object.keys(uploadedData[0]).filter(key => key !== 'id').map((key) => ({
                        field: key,
                        headerName: key,
                        width: key.toLowerCase().includes('email') ? 200 : 180,
                        editable: true,
                        headerClassName: 'column-header',
                        renderCell: (params) => {
                          const value = params.value;
                          return <div style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>{value}</div>;
                        }
                      }))
                  }
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  checkboxSelection
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  onRowSelectionModelChange={(newSelection) => {
                    console.log("Selection changed:", newSelection);
                    setSelectedRows(newSelection);
                  }}
                  selectionModel={selectedRows}
                  onCellEditCommit={handleCellEdit}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                  componentsProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  sx={{
                    '& .column-header': {
                      fontWeight: 'bold',
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      height: 'auto',
                      padding: '8px',
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      overflow: 'visible'
                    },
                    '& .MuiDataGrid-cell': {
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      padding: '8px',
                      overflow: 'visible',
                      height: 'auto',
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: '52px !important',
                      maxHeight: 'none !important'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      maxHeight: 'none !important',
                      minHeight: '80px !important'
                    }
                  }}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Add Row Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Row</DialogTitle>
        <DialogContent>
          {generateFormFields(newRow)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNewRow} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Row Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          {generateFormFields(editingRow, true)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEditedRow} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PreferencesPage;