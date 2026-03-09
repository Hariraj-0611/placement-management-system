# Placement Officer - Company Export Feature

## Overview
Added the same company-specific Excel export feature to the Placement Officer's Manage Applications page, matching the Staff Applications page functionality.

## Changes Made

### 1. Added xlsx Library Import
```javascript
import * as XLSX from 'xlsx';
```

### 2. Added State Variables
- `companies`: Array of unique company names extracted from applications
- `selectedCompany`: Currently selected company for export

### 3. Updated fetchApplications Function
- Extracts unique company names from applications
- Sorts companies alphabetically
- Updates companies state for dropdown

### 4. Added Export Function
`handleExportByCompany()`:
- Validates company selection
- Filters applications by selected company
- Creates Excel file with formatted data
- Includes columns: S.No, Student Name, Email, Register Number, Department, CGPA, Job Role, Package, Status, Applied Date, Remarks
- Sets optimized column widths
- Downloads file with naming format: `{Company}_Applications_YYYY-MM-DD.xlsx`
- Shows success/error toast messages

### 5. Added UI Section
**Export by Company Section** (Blue gradient box):
- Positioned right after the page title
- Company dropdown with all available companies
- Download button (enabled only when company selected)
- Feedback text showing selected company
- Building icon for visual clarity

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Manage Applications                                     │
├─────────────────────────────────────────────────────────┤
│ 🏢 Export Single Company Applications                   │
│    [Select Company Dropdown ▼]  [Download Button]      │
│    Ready to download applications for Google            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Search: [___________]  Status: [All Status ▼]          │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ [Statistics Cards]                                      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ [Applications Table]                                    │
└─────────────────────────────────────────────────────────┘
```

## Features

### Excel Export Details
- **File Format**: .xlsx (Excel format)
- **Sheet Name**: "Applications"
- **Filename Pattern**: `{Company}_Applications_YYYY-MM-DD.xlsx`
- **Example**: `Google_Applications_2026-03-09.xlsx`

### Data Included
1. Serial Number
2. Student Name
3. Email
4. Register Number
5. Department
6. CGPA (2 decimal places)
7. Job Role
8. Package (LPA)
9. Status
10. Applied Date (formatted)
11. Remarks

### Column Widths (Optimized)
- S.No: 6 characters
- Student Name: 20 characters
- Email: 30 characters
- Register Number: 15 characters
- Department: 20 characters
- CGPA: 8 characters
- Job Role: 25 characters
- Package: 12 characters
- Status: 12 characters
- Applied Date: 15 characters
- Remarks: 30 characters

## User Flow

1. User opens Manage Applications page
2. User sees prominent "Export Single Company Applications" section
3. User clicks dropdown and selects a company (e.g., "TCS")
4. Feedback text appears: "Ready to download applications for TCS"
5. Download button becomes enabled (blue with shadow)
6. User clicks Download button
7. Excel file downloads: `TCS_Applications_2026-03-09.xlsx`
8. Success toast: "Exported X applications to Excel"

## Error Handling

- **No Company Selected**: Shows error toast "Please select a company first"
- **No Applications Found**: Shows error toast "No applications found for this company"
- **Export Success**: Shows success toast with count of exported applications

## Differences from Staff Version

### Placement Officer (Full Access)
- Can export applications from ALL departments
- Can see all companies across all departments
- Has full application management capabilities
- Can change application status

### Staff (Department-Restricted)
- Can only export applications from their own department
- Only sees companies that have applications from their department
- Read-only access to applications
- Cannot change application status

## Technical Details

- **Package**: xlsx (version 0.18.5)
- **No Backend Changes**: Uses existing getApplications API
- **Client-Side Processing**: All filtering and export logic runs in browser
- **Responsive Design**: Works on all screen sizes
- **Consistent UI**: Matches Staff Applications page design

## Files Modified
- `placement-system/frontend/src/pages/placement/ManageApplications.jsx`

## Testing Checklist
- [x] xlsx package already installed
- [x] Export function implemented
- [x] UI section added
- [x] Company dropdown populated
- [x] Download button state management
- [x] Error handling added
- [x] Toast notifications working
- [ ] Test with actual application data
- [ ] Verify Excel file opens correctly
- [ ] Test with multiple companies
- [ ] Verify data accuracy
- [ ] Test with large datasets

## Date Completed
March 9, 2026
