import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EventRegistrationModalData } from '../types/eventRegistration';
import { formatDate } from '../constants/dateFormats';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToExcel = (data: EventRegistrationModalData, filename?: string) => {
  const { event, registered_users } = data;
  
  // Prepare data for Excel
  const excelData = registered_users.map((user, index) => ({
    'No.': index + 1,
    'Name': user.name || user.email.split('@')[0] || 'Unknown User',
    'Email': user.email,
    'Phone': user.phone || '-',
    'User Type': user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1),
    'Member Level': user.member_level.charAt(0).toUpperCase() + user.member_level.slice(1),
    'Registration Date': formatDate(user.registered_at, 'display'),
    'Status': user.is_active ? 'Active' : 'Inactive'
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 5 },   // No.
    { wch: 20 },  // Name
    { wch: 30 },  // Email
    { wch: 15 },  // Phone
    { wch: 12 },  // User Type
    { wch: 15 },  // Member Level
    { wch: 20 },  // Registration Date
    { wch: 10 }   // Status
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Registrations');

  // Generate filename
  const eventName = event.name_en.replace(/[^a-zA-Z0-9]/g, '_');
  const defaultFilename = `Event_Registrations_${eventName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, filename || defaultFilename);
};

export const exportToPDF = (data: EventRegistrationModalData, filename?: string) => {
  const { event, registered_users } = data;
  
  // Create new PDF document
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Event Registration Report', 14, 20);
  
  // Add event information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Event: ${event.name_en}`, 14, 30);
  doc.text(`Total Registrations: ${registered_users.length}`, 14, 35);
  doc.text(`Capacity: ${event.user_capacity || 'Unlimited'}`, 14, 40);
  doc.text(`Generated: ${formatDate(new Date().toISOString(), 'display')}`, 14, 45);
  
  // Prepare data for table
  const tableData = registered_users.map((user, index) => [
    index + 1,
    user.name || user.email.split('@')[0] || 'Unknown User',
    user.email,
    user.phone || '-',
    user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1),
    user.member_level.charAt(0).toUpperCase() + user.member_level.slice(1),
    formatDate(user.registered_at, 'display'),
    user.is_active ? 'Active' : 'Inactive'
  ]);

  // Add table
  autoTable(doc, {
    head: [['No.', 'Name', 'Email', 'Phone', 'User Type', 'Member Level', 'Registration Date', 'Status']],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 10 },  // No.
      1: { cellWidth: 25 },  // Name
      2: { cellWidth: 35 },  // Email
      3: { cellWidth: 20 },  // Phone
      4: { cellWidth: 15 },  // User Type
      5: { cellWidth: 18 },  // Member Level
      6: { cellWidth: 25 },  // Registration Date
      7: { cellWidth: 12 },  // Status
    },
    margin: { left: 14, right: 14 },
  });

  // Generate filename
  const eventName = event.name_en.replace(/[^a-zA-Z0-9]/g, '_');
  const defaultFilename = `Event_Registrations_${eventName}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Save file
  doc.save(filename || defaultFilename);
};
