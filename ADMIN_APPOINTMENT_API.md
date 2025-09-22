# Admin Appointment API Documentation

## Base URL
```
/api/v1/admin/appointments
```

## Authentication
```
Authorization: Bearer {admin_token}
```

---

## Endpoints

### 1. List Appointments
```
GET /api/v1/admin/appointments
```

**Query Parameters:**
- `per_page` (integer) - Items per page (default: 15, max: 100)
- `page` (integer) - Page number
- `search` (string) - Search by user name, email, phone, contact details
- `status` (string) - Filter by status (pending, confirmed, completed, cancelled, rescheduled)
- `property_listing_type_id` (integer) - Filter by property listing type
- `date_from` (date) - Filter from date (YYYY-MM-DD)
- `date_to` (date) - Filter to date (YYYY-MM-DD)
- `sort_by` (string) - Sort field (created_at, date, status, contact_name)
- `sort_direction` (string) - Sort direction (asc, desc)

**Example:**
```http
GET /api/v1/admin/appointments?status=pending&per_page=20
Authorization: Bearer {admin_token}
```

### 2. Get Statistics
```
GET /api/v1/admin/appointments/statistics
```

**Response:**
```json
{
    "success": true,
    "data": {
        "total_appointments": 150,
        "pending_appointments": 25,
        "confirmed_appointments": 80,
        "completed_appointments": 35,
        "cancelled_appointments": 8,
        "rescheduled_appointments": 2,
        "today_appointments": 5,
        "this_week_appointments": 20,
        "this_month_appointments": 75
    }
}
```

### 3. Get Appointment Details
```
GET /api/v1/admin/appointments/{id}
```

### 4. Accept Appointment
```
POST /api/v1/admin/appointments/{id}/accept
```

**Request Body:**
```json
{
    "admin_notes": "Confirmed for morning slot",
    "schedule_start_time": "09:00:00",
    "schedule_end_time": "11:00:00"
}
```

**Status Flow:** `pending` → `confirmed`

### 5. Reschedule Appointment
```
POST /api/v1/admin/appointments/{id}/reschedule
```

**Request Body:**
```json
{
    "date": "2024-01-25",
    "schedule_start_time": "14:00:00",
    "schedule_end_time": "16:00:00",
    "admin_notes": "Rescheduled to afternoon"
}
```

**Status Flow:** `pending`/`confirmed` → `rescheduled`

### 6. Cancel Appointment
```
POST /api/v1/admin/appointments/{id}/cancel
```

**Request Body:**
```json
{
    "admin_notes": "Cancelled due to conflict"
}
```

**Status Flow:** Any status → `cancelled`

### 7. Complete Appointment
```
POST /api/v1/admin/appointments/{id}/complete
```

**Request Body:**
```json
{
    "admin_notes": "Consultation completed successfully"
}
```

**Status Flow:** `confirmed`/`rescheduled` → `completed`

### 8. Delete Appointment
```
DELETE /api/v1/admin/appointments/{id}
```

---

## Status Flow

```
pending → confirmed → completed
   ↓         ↓
cancelled  rescheduled → completed
   ↓         ↓
deleted    cancelled
```

## Push Notifications

All status changes trigger push notifications:
- `appointment_confirmed`
- `appointment_rescheduled`
- `appointment_cancelled`
- `appointment_completed`

## Error Responses

### Validation Error (422)
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "schedule_end_time": ["The schedule end time must be after schedule start time."]
    }
}
```

### Not Found (404)
```json
{
    "success": false,
    "message": "Appointment not found"
}
```

### Status Conflict (422)
```json
{
    "success": false,
    "message": "Appointment is already confirmed"
}
```

---

## Usage Examples

### List Pending Appointments
```http
GET /api/v1/admin/appointments?status=pending&per_page=10
Authorization: Bearer {admin_token}
```

### Accept Appointment
```http
POST /api/v1/admin/appointments/1/accept
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "admin_notes": "Confirmed for morning consultation",
    "schedule_start_time": "09:00:00",
    "schedule_end_time": "11:00:00"
}
```

### Reschedule Appointment
```http
POST /api/v1/admin/appointments/1/reschedule
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "date": "2024-01-25",
    "schedule_start_time": "14:00:00",
    "schedule_end_time": "16:00:00",
    "admin_notes": "Rescheduled to afternoon slot"
}
```

---

## React Integration

### React Query Example
```javascript
// List appointments
const { data: appointments, isLoading } = useQuery({
  queryKey: ['appointments', filters],
  queryFn: () => fetchAppointments(filters)
});

// Accept appointment
const acceptMutation = useMutation({
  mutationFn: (data) => acceptAppointment(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['appointments']);
  }
});
```

### State Management
```javascript
// Redux/Zustand state
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    list: [],
    statistics: {},
    loading: false,
    error: null
  },
  reducers: {
    setAppointments: (state, action) => {
      state.list = action.payload;
    },
    updateAppointmentStatus: (state, action) => {
      const { id, status } = action.payload;
      const appointment = state.list.find(apt => apt.id === id);
      if (appointment) {
        appointment.status = status;
      }
    }
  }
});
```

---

*Last updated: January 2024*
*Version: 1.0.0*
