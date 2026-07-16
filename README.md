# QuickBite Food Delivery App

A comprehensive Food Delivery application consisting of a mobile frontend and a backend API. This repository contains the complete source code for both parts of the system.

## Project Structure

The workspace is divided into two main projects:

1. **`quickbite/`**: The React Native frontend mobile application.
2. **`backend/`**: The Python/Django backend API and administrative interface.

---

## 📱 Frontend (`quickbite`)

The frontend is built using **React Native** and provides a dynamic, user-friendly interface for browsing menus, managing the cart, and handling checkout.

### Features
- Modern UI with dynamic themes and smooth animations.
- Complete user flow (Home, Food Details, Cart, Checkout, Profile).
- Fast Refresh and Hot Reloading enabled.

### Prerequisites (Frontend)
- Node.js (v18 or newer recommended)
- React Native development environment (Android Studio / Xcode)
- Yarn or npm

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd quickbite
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the Metro bundler:
   ```bash
   npm start
   ```
4. Run on your device/emulator:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

---

## ⚙️ Backend (`backend`)

The backend is built with **Django** and serves the REST API for the mobile application.

### Features
- Secure API endpoints for user authentication, orders, and restaurants.
- SQLite database (can be upgraded to PostgreSQL/MySQL).
- Python Virtual Environment ready.

### Prerequisites (Backend)
- Python 3.9+
- pip (Python package installer)

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv .venv
   
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations (if any):
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

---

## Contributing

Contributions are welcome! Please create a feature branch and submit a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.


## Android Release Credentials

The following credentials are used for signing the Android APK release build:
- **Keystore File:** 'quickbite/android/app/my-upload-key.keystore'
- **Keystore Password:** 'quickbite123'
- **Key Alias:** 'my-key-alias'
- **Key Password:** 'quickbite123'

