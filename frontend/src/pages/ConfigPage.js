import React, { useState, useMemo, useEffect } from 'react';
import { Container, Typography, Paper, Button, Grid, Box, Alert, CircularProgress, TextField, InputAdornment, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const ConfigPage = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);

  // Add state for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCell, setEditCell] = useState({ id: null, field: null, value: null });
  const [editValue, setEditValue] = useState('');

  // Use memoized data for the grid
  const processedData = useMemo(() => {
    if (!uploadedData) return [];
    return searchText ? filteredData : uploadedData;
  }, [searchText, filteredData, uploadedData]);

  // Reset selection when data changes
  useEffect(() => {
    if (uploadedData) {
      setSelectedRows([]);
    }
  }, [uploadedData]);

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

  // Handle delete selected rows
  const handleDeleteRows = () => {
    if (selectedRows.length === 0) return;
    
    // Create a new array without the selected rows
    const updatedData = uploadedData.filter(row => !selectedRows.includes(row.id));
    
    // Update both the main data and filtered data
    setUploadedData(updatedData);
    setFilteredData(updatedData);
    setSelectedRows([]);
    
    // Recalculate totals immediately
    // Recalculate row totals
    const dataWithRowTotals = updatedData.map(row => {
      let rowTotal = 0;
      Object.keys(row).forEach(key => {
        if (key !== 'id' && key !== 'rowTotal') {
          const value = parseFloat(row[key]);
          if (!isNaN(value)) {
            rowTotal += value;
          }
        }
      });
      return { ...row, rowTotal };
    });
    
    // Recalculate column totals
    const columnTotals = {};
    const columnKeys = columnOrder.length > 0 
      ? columnOrder 
      : Object.keys(updatedData[0]).filter(key => key !== 'id');
    
    columnKeys.forEach(key => {
      // Skip non-numeric columns
      if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) {
        columnTotals[key] = '';
        return;
      }
      
      // Calculate sum for numeric columns
      const sum = updatedData.reduce((acc, row) => {
        const value = parseFloat(row[key]);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
      
      columnTotals[key] = sum;
    });
    
    // Calculate the total of all column totals
    let grandTotal = 0;
    Object.values(columnTotals).forEach(value => {
      if (typeof value === 'number') {
        grandTotal += value;
      }
    });
    
    columnTotals.rowTotal = grandTotal;
    
    // Create the total row
    const totalRowData = { id: 'total-row' };
    Object.keys(columnTotals).forEach(key => {
      totalRowData[key] = columnTotals[key];
    });
    
    // Update the grid data with the new totals
    setGridDataWithTotal([...dataWithRowTotals, totalRowData]);
    
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
    
    const updatedData = [...uploadedData, newRowData];
    setUploadedData(updatedData);
    setFilteredData(updatedData);
    
    // Recalculate totals immediately
    // Recalculate row totals
    const dataWithRowTotals = updatedData.map(row => {
      let rowTotal = 0;
      Object.keys(row).forEach(key => {
        if (key !== 'id' && key !== 'rowTotal') {
          const value = parseFloat(row[key]);
          if (!isNaN(value)) {
            rowTotal += value;
          }
        }
      });
      return { ...row, rowTotal };
    });
    
    // Recalculate column totals
    const columnTotals = {};
    const columnKeys = columnOrder.length > 0 
      ? columnOrder 
      : Object.keys(updatedData[0]).filter(key => key !== 'id');
    
    columnKeys.forEach(key => {
      // Skip non-numeric columns
      if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) {
        columnTotals[key] = '';
        return;
      }
      
      // Calculate sum for numeric columns
      const sum = updatedData.reduce((acc, row) => {
        const value = parseFloat(row[key]);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
      
      columnTotals[key] = sum;
    });
    
    // Calculate the total of all column totals
    let grandTotal = 0;
    Object.values(columnTotals).forEach(value => {
      if (typeof value === 'number') {
        grandTotal += value;
      }
    });
    
    columnTotals.rowTotal = grandTotal;
    
    // Create the total row
    const totalRowData = { id: 'total-row' };
    Object.keys(columnTotals).forEach(key => {
      totalRowData[key] = columnTotals[key];
    });
    
    // Update the grid data with the new totals
    setGridDataWithTotal([...dataWithRowTotals, totalRowData]);
    
    setUploadStatus({
      type: 'success',
      message: 'New row added successfully.'
    });
  };

  // Calculate totals for each column
  const calculateTotals = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return {};
    
    const totals = {};
    const columnKeys = columnOrder.length > 0 
      ? columnOrder 
      : Object.keys(uploadedData[0]).filter(key => key !== 'id');
    
    columnKeys.forEach(key => {
      // Skip non-numeric columns
      if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) {
        totals[key] = '';
        return;
      }
      
      // Calculate sum for numeric columns
      const sum = uploadedData.reduce((acc, row) => {
        const value = parseFloat(row[key]);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
      
      totals[key] = sum;
    });
    
    // Calculate the total of all column totals
    let grandTotal = 0;
    Object.values(totals).forEach(value => {
      if (typeof value === 'number') {
        grandTotal += value;
      }
    });
    
    totals.rowTotal = grandTotal;
    
    return totals;
  }, [uploadedData, columnOrder]);

  // Create a total row
  const totalRow = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return null;
    
    const totals = calculateTotals;
    const totalRowData = { id: 'total-row' };
    
    Object.keys(totals).forEach(key => {
      totalRowData[key] = totals[key];
    });
    
    return totalRowData;
  }, [calculateTotals]);

  // State for grid data with totals
  const [gridDataWithTotal, setGridDataWithTotal] = useState([]);

  // Combine data with total row
  useEffect(() => {
    if (!processedData) return;
    
    // Add rowTotal to each row
    const dataWithRowTotals = processedData.map(row => {
      let rowTotal = 0;
      Object.keys(row).forEach(key => {
        if (key !== 'id') {
          const value = parseFloat(row[key]);
          if (!isNaN(value)) {
            rowTotal += value;
          }
        }
      });
      return { ...row, rowTotal };
    });
    
    setGridDataWithTotal([...dataWithRowTotals, totalRow].filter(Boolean));
  }, [processedData, totalRow]);

  // Add a ref to the DataGrid
  const dataGridRef = React.useRef(null);

  // Handle cell edit
  const handleCellEdit = (params) => {
    const { id, field, value } = params;
    
    console.log(`Editing cell: id=${id}, field=${field}, value=${value}`);
    
    // Find the row in uploadedData
    const rowIndex = uploadedData.findIndex(row => row.id === id);
    if (rowIndex === -1) {
      console.error(`Row with id ${id} not found in uploadedData`);
      return;
    }
    
    // Create a deep copy of uploadedData
    const updatedData = JSON.parse(JSON.stringify(uploadedData));
    
    // Update the specific field in the row
    updatedData[rowIndex][field] = value;
    
    console.log(`Updated row ${id}: ${field} from ${uploadedData[rowIndex][field]} to ${value}`);
    console.log("Updated data:", updatedData);
    
    // Update the state with a new reference to ensure React detects the change
    setUploadedData([...updatedData]);
    setFilteredData([...updatedData]);
    
    // Recalculate totals immediately
    // Recalculate row totals
    const dataWithRowTotals = updatedData.map(row => {
      let rowTotal = 0;
      Object.keys(row).forEach(key => {
        if (key !== 'id' && key !== 'rowTotal') {
          const value = parseFloat(row[key]);
          if (!isNaN(value)) {
            rowTotal += value;
          }
        }
      });
      return { ...row, rowTotal };
    });
    
    // Recalculate column totals
    const columnTotals = {};
    const columnKeys = columnOrder.length > 0 
      ? columnOrder 
      : Object.keys(updatedData[0]).filter(key => key !== 'id');
    
    columnKeys.forEach(key => {
      // Skip non-numeric columns
      if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) {
        columnTotals[key] = '';
        return;
      }
      
      // Calculate sum for numeric columns
      const sum = updatedData.reduce((acc, row) => {
        const value = parseFloat(row[key]);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
      
      columnTotals[key] = sum;
    });
    
    // Calculate the total of all column totals
    let grandTotal = 0;
    Object.values(columnTotals).forEach(value => {
      if (typeof value === 'number') {
        grandTotal += value;
      }
    });
    
    columnTotals.rowTotal = grandTotal;
    
    // Create the total row
    const totalRowData = { id: 'total-row' };
    Object.keys(columnTotals).forEach(key => {
      totalRowData[key] = columnTotals[key];
    });
    
    // Update the grid data with the new totals
    const newGridData = [...dataWithRowTotals, totalRowData];
    setGridDataWithTotal(newGridData);
    
    // Log the final state for debugging
    console.log("Final grid data:", newGridData);
    
    // Show success message for cell edit
    setUploadStatus({
      type: 'success',
      message: `Cell updated successfully.`
    });
  };

  // Recalculate totals when data changes
  useEffect(() => {
    if (uploadedData) {
      // Recalculate row totals
      const dataWithRowTotals = uploadedData.map(row => {
        let rowTotal = 0;
        Object.keys(row).forEach(key => {
          if (key !== 'id' && key !== 'rowTotal') {
            const value = parseFloat(row[key]);
            if (!isNaN(value)) {
              rowTotal += value;
            }
          }
        });
        return { ...row, rowTotal };
      });
      
      // Recalculate column totals
      const columnTotals = {};
      const columnKeys = columnOrder.length > 0 
        ? columnOrder 
        : Object.keys(uploadedData[0]).filter(key => key !== 'id');
      
      columnKeys.forEach(key => {
        // Skip non-numeric columns
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) {
          columnTotals[key] = '';
          return;
        }
        
        // Calculate sum for numeric columns
        const sum = uploadedData.reduce((acc, row) => {
          const value = parseFloat(row[key]);
          return acc + (isNaN(value) ? 0 : value);
        }, 0);
        
        columnTotals[key] = sum;
      });
      
      // Calculate the total of all column totals
      let grandTotal = 0;
      Object.values(columnTotals).forEach(value => {
        if (typeof value === 'number') {
          grandTotal += value;
        }
      });
      
      columnTotals.rowTotal = grandTotal;
      
      // Create the total row
      const totalRowData = { id: 'total-row' };
      Object.keys(columnTotals).forEach(key => {
        totalRowData[key] = columnTotals[key];
      });
      
      // Update the grid data with the new totals
      setGridDataWithTotal([...dataWithRowTotals, totalRowData]);
    }
  }, [uploadedData, columnOrder]);

  // Handle opening the edit dialog
  const handleOpenEditDialog = (id, field, value) => {
    setEditCell({ id, field, value });
    setEditValue(value);
    setEditDialogOpen(true);
  };
  
  // Handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  
  // Handle saving the edit
  const handleSaveEdit = () => {
    if (editCell.id && editCell.field) {
      handleCellEdit({
        id: editCell.id,
        field: editCell.field,
        value: editValue
      });
      setEditDialogOpen(false);
    }
  };

  // Create columns based on the column order
  const columns = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    // Use the stored column order if available, otherwise use the first row's keys
    const columnKeys = columnOrder.length > 0 
      ? columnOrder 
      : Object.keys(uploadedData[0]).filter(key => key !== 'id');
    
    // Create regular columns
    const regularColumns = columnKeys.map((key) => ({
      field: key,
      headerName: key,
      width: key.toLowerCase().includes('email') ? 200 : 180,
      editable: false, // Set to false to disable built-in editing
      headerClassName: 'column-header',
      renderCell: (params) => {
        const value = params.value;
        const isCapacityCell = key.toLowerCase().includes('capacity');
        const isSchoolNameCell = key === 'School Name';
        const isTotalRow = params.id === 'total-row';
        
        // For capacity cells or school name cells, add click-to-edit functionality
        if ((isCapacityCell || isSchoolNameCell) && !isTotalRow) {
          return (
            <div 
              style={{ 
                whiteSpace: 'normal', 
                lineHeight: '1.2',
                padding: '8px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => handleOpenEditDialog(params.id, key, value)}
            >
              {value}
              <EditIcon 
                style={{ 
                  position: 'absolute', 
                  right: '8px', 
                  fontSize: '16px',
                  opacity: 0.5
                }} 
              />
            </div>
          );
        }
        
        // For non-editable cells, just display the value
        return (
          <div style={{ 
            whiteSpace: 'normal', 
            lineHeight: '1.2',
            padding: '8px',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}>
            {value}
          </div>
        );
      }
    }));
    
    // Add a total column at the end
    return [
      ...regularColumns,
      {
        field: 'rowTotal',
        headerName: 'Row Total',
        width: 150,
        editable: false,
        headerClassName: 'column-header total-column',
        renderCell: (params) => {
          // Skip the total row
          if (params.id === 'total-row') {
            return (
              <div style={{ 
                whiteSpace: 'normal', 
                lineHeight: '1.2',
                padding: '8px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {params.value}
              </div>
            );
          }
          
          // Calculate row total for regular rows
          const rowData = params.row;
          let total = 0;
          
          // Sum all numeric values in the row
          Object.keys(rowData).forEach(key => {
            if (key !== 'id' && key !== 'rowTotal') {
              const value = parseFloat(rowData[key]);
              if (!isNaN(value)) {
                total += value;
              }
            }
          });
          
          return (
            <div style={{ 
              whiteSpace: 'normal', 
              lineHeight: '1.2',
              padding: '8px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {total}
            </div>
          );
        }
      }
    ];
  }, [uploadedData, columnOrder]);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setIsLoading(true);
      setUploadStatus({
        type: 'info',
        message: `Processing file "${selectedFile.name}"...`
      });

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await axios.post('/api/config/import', formData);

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
        setUploadStatus({
          type: 'error',
          message: error.message
        });
      } finally {
        setIsLoading(false);
      }
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

  // Add a function to load data from the database
  const loadDataFromDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/config/load');
      
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
            message: 'No data found in database. Please upload a configuration file.'
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

  // Save data to database
  const saveDataToDatabase = async () => {
    try {
      setIsLoading(true);
      console.log("Saving data to database:", uploadedData);
      
      // Make sure we're sending the correct data
      const dataToSave = uploadedData.filter(row => row.id !== 'total-row');
      console.log("Filtered data to save:", dataToSave);
      
      // Log each school's data to verify
      dataToSave.forEach(school => {
        console.log(`School: ${school['School Name']}, Session 1: ${school['Capacity Breakout Session 1']}`);
      });
      
      // Create a deep copy of the data to ensure we're not sending any references
      const dataToSaveCopy = JSON.parse(JSON.stringify(dataToSave));
      
      const response = await axios.post('/api/config/save', {
        data: dataToSaveCopy
      });
      
      console.log("Save response:", response.data);
      
      if (response.data.success) {
        setUploadStatus({
          type: 'success',
          message: response.data.message || 'Configuration saved successfully.'
        });
        
        // Reload data from database to ensure we have the latest data
        loadDataFromDatabase();
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.error || 'Failed to save configuration.'
        });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error saving configuration.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to clear data from the database
  const clearDataFromDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/config/clear');
      
      if (response.data.success) {
        setUploadedData(null);
        setFilteredData(null);
        setColumnOrder([]);
        setUploadStatus({
          type: 'success',
          message: response.data.message || 'Configuration data cleared successfully.'
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: response.data.error || 'Failed to clear configuration data.'
        });
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error clearing configuration data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data from database when component mounts
  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  // Create a custom toolbar component with a save button
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          color="primary"
          onClick={saveDataToDatabase}
          startIcon={<SaveIcon />}
          disabled={!uploadedData || uploadedData.length === 0}
        >
          Save to Database
        </Button>
      </GridToolbarContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" align="center">
            Configuration Management
          </Typography>
        </Box>
        <Typography paragraph color="text.secondary" sx={{ mb: 2 }} align="center">
          Upload and manage school configuration data. Each school has 6 breakout sessions with specific capacities.
          You can edit the data in the table below. Click on any cell to edit its value.
          Click "Save Configuration" to persist your changes to the database.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box 
              {...getRootProps()} 
              sx={{
                border: '2px dashed #cccccc',
                borderRadius: 2,
                p: 2,
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
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
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  <Tooltip title="Refresh data from database">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={loadDataFromDatabase}
                      startIcon={<RefreshIcon />}
                      size="small"
                    >
                      Refresh Data
                    </Button>
                  </Tooltip>
                  <Tooltip title="Save configuration to database">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={saveDataToDatabase}
                      startIcon={<SaveIcon />}
                      disabled={!uploadedData || uploadedData.length === 0}
                      size="small"
                    >
                      Save Configuration
                    </Button>
                  </Tooltip>
                  <Tooltip title="Clear database">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={clearDataFromDatabase}
                      startIcon={<DeleteIcon />}
                      disabled={!uploadedData || uploadedData.length === 0}
                      size="small"
                    >
                      Clear Database
                    </Button>
                  </Tooltip>
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
              
              <Paper elevation={2} sx={{ p: 1, height: 'calc(100vh - 200px)', width: '100%', overflow: 'hidden' }}>
                <DataGrid
                  ref={dataGridRef}
                  rows={gridDataWithTotal || []}
                  columns={columns}
                  pageSize={25}
                  rowsPerPageOptions={[25, 50, 100, 200]}
                  checkboxSelection
                  disableSelectionOnClick={true}
                  getRowId={(row) => row.id}
                  onRowSelectionModelChange={(newSelection) => {
                    console.log("Selection changed:", newSelection);
                    setSelectedRows(newSelection);
                  }}
                  components={{
                    Toolbar: CustomToolbar,
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
                    '& .column-header.total-column': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      fontWeight: 'bold',
                      borderLeft: '2px solid #1976d2'
                    },
                    '& .MuiDataGrid-cell': {
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      padding: '8px',
                      overflow: 'visible',
                      height: 'auto',
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: '52px !important',
                      maxHeight: 'none !important'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      maxHeight: 'none !important',
                      minHeight: '80px !important'
                    },
                    '& .MuiDataGrid-cell:focus': {
                      outline: '2px solid #1976d2',
                      outlineOffset: '-2px'
                    },
                    '& .MuiDataGrid-row[data-id="total-row"]': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)'
                      }
                    },
                    '& .MuiDataGrid-cell[data-field="rowTotal"]': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      borderLeft: '2px solid #1976d2',
                      fontWeight: 'bold'
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      overflow: 'auto !important'
                    },
                    '& .MuiDataGrid-virtualScrollerContent': {
                      minHeight: '100% !important'
                    }
                  }}
                  selectionModel={selectedRows}
                  onSelectionModelChange={(newSelection) => {
                    console.log("Selection changed:", newSelection);
                    setSelectedRows(newSelection);
                  }}
                  autoHeight={false}
                  disableColumnMenu
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  disableExportOptions
                  disableColumnReorder
                  disableColumnResize
                  disableExtendRowFullWidth
                  disableRowSelectionOnClick
                  disableVirtualization={false}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Add the edit dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Cell Value</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={editCell.field}
            type="text"
            fullWidth
            variant="outlined"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConfigPage;