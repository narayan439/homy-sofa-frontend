# Database Migration for Multiple Services Support

## Changes Required in MySQL Database

Run the following SQL commands to add the new columns:

```sql
-- Add completion_date column to track when booking was completed
ALTER TABLE bookings ADD COLUMN completion_date VARCHAR(50) DEFAULT NULL;

-- Add additional_services_json column to store multiple services as JSON array
ALTER TABLE bookings ADD COLUMN additional_services_json LONGTEXT DEFAULT NULL;
```

## Schema Details

### completion_date
- **Type**: VARCHAR(50)
- **Purpose**: Stores the date when a booking was completed (format: yyyy-MM-dd)
- **Nullable**: Yes
- **Default**: NULL

### additional_services_json
- **Type**: LONGTEXT
- **Purpose**: Stores all additional services as a JSON array
- **Example Format**: `[{"id":"1","name":"Service Name","price":500},{"id":"2","name":"Another Service","price":300}]`
- **Nullable**: Yes
- **Default**: NULL
- **Note**: Backward compatible with existing `additional_service_name` and `additional_service_price` columns

## Backward Compatibility

- The system maintains backward compatibility with the single-service fields:
  - `additional_service_name` (still stores first service name)
  - `additional_service_price` (still stores first service price)
- New JSON field (`additional_services_json`) stores all services
- Existing data will continue to work without migration

## Frontend Changes

1. **Price Handling**:
   - Price is now set from the admin-entered "Amount Needed" field (extraAmount)
   - No longer uses the default service price from the service table

2. **Completion Date**:
   - New date field in the "Complete Booking" dialog
   - Allows admin to specify when the work was actually completed

3. **Multiple Services**:
   - Admin can now add multiple services in one booking approval
   - Each service requires:
     - Service selection (dropdown, filtered to exclude current service)
     - Amount needed (admin enters actual cost, not from service default)
     - Instruments needed (required field)

## Usage Example

When admin approves a booking with multiple services:
1. Check "Add new service(s)?" checkbox
2. Select first service from dropdown
3. Enter amount needed (e.g., 500)
4. Enter instruments needed (e.g., "drill, wrench")
5. Click "Add Service" button
6. Repeat for additional services
7. Click "Save" to submit

All services are sent to backend as JSON array and stored in `additional_services_json` column.
