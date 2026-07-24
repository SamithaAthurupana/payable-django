# CircleFund

CircleFund is a simple group savings application built as part of the Payable Associate Software Engineer (Full Stack) technical assessment.

## Tech Stack

### Backend
- Python 3.12
- Django
- Django REST Framework
- Simple JWT Authentication
- SQLite

### Mobile
- React Native
- Expo
- TypeScript
- Axios

---

## Features

### Authentication
- User registration
- JWT login
- Protected API endpoints

### Circle Management
- Create a savings circle
- Join a circle using an invite code
- Maximum of four members per circle
- Automatic member rotation order

### Round Management
- Create savings rounds
- Track contributions
- Late contribution penalties
- Admin approval workflow
- Automatic next-round creation

### Mobile Application
- Login screen
- Circle member list
- Contribution status
- Contribute action
- Admin payout approval

---

## Project Structure

```
backend/
    backend/
    circles/
    manage.py

mobile/
    src/
        app/
        components/
        services/
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
```

Backend URL

```
http://127.0.0.1:8000
```

---

## Mobile Setup

```bash
cd mobile

npm install

npm start
```

---

## API Authentication

Authentication uses JSON Web Tokens (JWT).

Example

```
POST /api/login/
```

returns

```
access
refresh
```

The access token must be included in the Authorization header.

```
Authorization: Bearer <access_token>
```

---

## Future Improvements

If given more time, I would:

- Improve validation and error handling
- Add automated unit and integration tests
- Improve UI/UX
- Add pagination and filtering
- Improve concurrency testing
- Deploy the application using Docker and cloud hosting
