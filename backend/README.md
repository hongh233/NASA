# NASA Arctic SMS Service

A Python Flask backend service that provides SMS notifications for Arctic ice data updates using Twilio.

## Features

- ✅ Send SMS notifications using Twilio
- ✅ Support for English and French languages
- ✅ Subscriber management (subscribe/unsubscribe)
- ✅ Broadcast updates to all subscribers
- ✅ **Calendar-based scheduling** for future SMS delivery
- ✅ **Personal and broadcast scheduling** with different message types
- ✅ **Background scheduler** with automatic message delivery
- ✅ RESTful API endpoints
- ✅ Dummy data for testing

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the Twilio credentials if needed (currently using provided test credentials)

3. **Run the service:**
   ```bash
   python sms_service.py
   ```

   The service will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the service is running

### SMS Operations
- **POST** `/sms/send` - Send SMS to a specific phone number
  ```json
  {
    "phone": "+1234567890",
    "message": "Your message here",
    "language": "en" // or "fr"
  }
  ```

- **POST** `/sms/subscribe` - Subscribe to SMS updates
  ```json
  {
    "phone": "+1234567890",
    "language": "en" // or "fr"
  }
  ```

- **POST** `/sms/unsubscribe` - Unsubscribe from SMS updates
  ```json
  {
    "phone": "+1234567890"
  }
  ```

- **GET** `/sms/subscribers` - Get list of all active subscribers

- **POST** `/sms/broadcast` - Send Arctic update to all subscribers
  ```json
  {
    "type": "ice_loss", // or "temperature", "general"
    "language": "en" // or "fr"
  }
  ```

- **POST** `/sms/test` - Test SMS functionality (uses dummy phone number)

### Scheduling Operations
- **POST** `/sms/schedule` - Schedule an SMS message for future delivery
  ```json
  {
    "phone": "+1234567890",
    "message": "Your scheduled message",
    "scheduled_time": "2025-10-26T15:30:00.000Z",
    "language": "en", // or "fr"
    "type": "custom" // or "arctic_ice_loss", etc.
  }
  ```

- **GET** `/sms/scheduled` - Get all scheduled messages
  - Optional query param: `?phone=+1234567890` to filter by phone number

- **DELETE** `/sms/scheduled/{message_id}` - Cancel a scheduled message

- **POST** `/sms/schedule/arctic` - Schedule Arctic update for all subscribers
  ```json
  {
    "scheduled_time": "2025-10-26T15:30:00.000Z",
    "type": "ice_loss", // or "temperature", "general"
    "language": "en" // or "fr"
  }
  ```

## Twilio Configuration

The service uses your Twilio credentials (configured in .env file):
- **Account SID:** `your_twilio_account_sid_here`
- **Auth Token:** `your_twilio_auth_token_here`
- **From Phone:** `+1234567890`

## Language Support

The service supports bilingual SMS messages:
- **English (en):** Default language with standard messaging
- **French (fr):** Includes "VIVE LE QUEBEC LIBRE!" and French translations

## Scheduling System

The backend includes a **background scheduler** that automatically sends messages at their scheduled times:
- **Automatic delivery:** Messages are checked every 30 seconds and sent when their time arrives
- **Status tracking:** Messages have statuses: `scheduled`, `sent`, `failed`, `cancelled`
- **Personal scheduling:** Individual users can schedule custom messages
- **Broadcast scheduling:** Admins can schedule Arctic updates for all subscribers
- **Time validation:** Scheduled times must be in the future
- **Multi-language support:** Scheduled messages respect each subscriber's language preference

## Testing

To test the SMS functionality:
1. Update the `test_phone` number in the `/sms/test` endpoint
2. Make a POST request to `/sms/test`
3. Check your phone for the test message

## Integration with Frontend

This backend service is designed to work with the NASA Arctic frontend application, providing SMS notifications when Arctic ice data is updated.