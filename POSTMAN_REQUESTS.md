# TeleMedicine API - Postman Requests

## 🚀 **Base URL**
```
http://localhost:3000/api
```

## 📋 **Authentication Endpoints**

### **1. Register Doctor**
**POST** `/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "doctor.john@telemedicine.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Dr. John Smith",
  "role": "DOCTOR"
}
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": {
    "email": "doctor.john@telemedicine.com",
    "fullName": "Dr. John Smith",
    "role": "DOCTOR"
  },
  "message": "You are registered successfully"
}
```

---

### **2. Register Patient**
**POST** `/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "patient.jane@telemedicine.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Jane Doe",
  "role": "PATIENT"
}
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": {
    "email": "patient.jane@telemedicine.com",
    "fullName": "Jane Doe",
    "role": "PATIENT"
  },
  "message": "You are registered successfully"
}
```

---

### **3. Login Doctor**
**POST** `/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "doctor.john@telemedicine.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": {
    "email": "doctor.john@telemedicine.com",
    "fullName": "Dr. John Smith",
    "role": "DOCTOR",
    "isDoctor": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful!"
}
```

---

### **4. Login Patient**
**POST** `/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "patient.jane@telemedicine.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": {
    "email": "patient.jane@telemedicine.com",
    "fullName": "Jane Doe",
    "role": "PATIENT",
    "isDoctor": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful!"
}
```

---

### **5. Get Doctor Specializations**
**GET** `/auth/doctor-specializations`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": [
    "General Practitioner (GP)",
    "Cardiologist",
    "Pediatrician",
    "Orthopedic Surgeon",
    "Gynecologist",
    "Obstetrician (OB)",
    "Dermatologist",
    "Endocrinologist",
    "Neurologist",
    "Psychiatrist",
    "Gastroenterologist",
    "Pulmonologist",
    "Oncologist",
    "Ophthalmologist",
    "Urologist"
  ],
  "message": "Doctor specializations fetched successfully"
}
```

---

## 👤 **Profile Endpoints**

### **6. Update Doctor Profile**
**PUT** `/profile/update-profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <doctor_token>
```

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "age": 35,
  "contactNumber": "+1234567890",
  "address": "123 Medical Center Dr, City, State 12345",
  "specialization": "Cardiologist",
  "experience": 10,
  "consultationTiming": "9:00 AM-5:00 PM",
  "licenseNumber": "MD12345",
  "education": "Harvard Medical School",
  "certifications": "Board Certified Cardiologist",
  "languages": "English, Spanish"
}
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": {
    "acknowledged": true,
    "modifiedCount": 1,
    "upsertedId": "507f1f77bcf86cd799439011",
    "upsertedCount": 1,
    "matchedCount": 1
  },
  "message": "Doctor profile updated successfully"
}
```

---

### **7. Update Patient Profile**
**PUT** `/profile/update-profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <patient_token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "age": 28,
  "bloodGroup": "O+",
  "weight": 65,
  "height": 165,
  "contactNumber": "+1234567890",
  "address": "456 Health Street, City, State 12345",
  "ongoingTreatment": "None",
  "healthIssues": "Hypertension, Diabetes",
  "allergies": "Penicillin",
  "emergencyContact": {
    "name": "John Doe",
    "relationship": "Spouse",
    "phone": "+1234567891"
  }
}
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": {
    "acknowledged": true,
    "modifiedCount": 1,
    "upsertedId": "507f1f77bcf86cd799439012",
    "upsertedCount": 1,
    "matchedCount": 1
  },
  "message": "Patient profile updated successfully"
}
```

---

### **8. Get Profile**
**GET** `/profile/get-profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <user_token>
```

**Expected Response (200) - Doctor:**
```json
{
  "status": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "doctor.john@telemedicine.com",
    "fullName": "Dr. John Smith",
    "role": "DOCTOR",
    "isDoctor": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "profile": {
      "userId": "507f1f77bcf86cd799439011",
      "name": "Dr. John Smith",
      "age": 35,
      "contactNumber": "+1234567890",
      "address": "123 Medical Center Dr, City, State 12345",
      "specialization": "Cardiologist",
      "experience": 10,
      "consultationTiming": "9:00 AM-5:00 PM",
      "licenseNumber": "MD12345",
      "education": "Harvard Medical School",
      "certifications": ["Board Certified Cardiologist"],
      "languages": ["English", "Spanish"],
      "profileImage": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Profile fetched successfully"
}
```

**Expected Response (200) - Patient:**
```json
{
  "status": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "patient.jane@telemedicine.com",
    "fullName": "Jane Doe",
    "role": "PATIENT",
    "isDoctor": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "profile": {
      "userId": "507f1f77bcf86cd799439012",
      "name": "Jane Doe",
      "age": 28,
      "contactNumber": "+1234567890",
      "address": "456 Health Street, City, State 12345",
      "bloodGroup": "O+",
      "weight": 65,
      "height": 165,
      "ongoingTreatment": "None",
      "healthIssues": ["Hypertension", "Diabetes"],
      "allergies": ["Penicillin"],
      "emergencyContact": {
        "name": "John Doe",
        "relationship": "Spouse",
        "phone": "+1234567891"
      },
      "bmi": 23.9,
      "smokingStatus": "Never",
      "alcoholConsumption": "None",
      "exerciseFrequency": "Never",
      "chronicConditions": [],
      "medications": [],
      "insuranceInfo": {},
      "preferredLanguage": null,
      "isActive": true,
      "profileImage": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Profile fetched successfully"
}
```

---

## 🏥 **Appointment Endpoints**

### **9. Get All Doctors (Public)**
**GET** `/appointment/get-all-doctors`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <any_user_token>
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "doctor.john@telemedicine.com",
      "fullName": "Dr. John Smith",
      "role": "DOCTOR",
      "isDoctor": true,
      "profile": {
        "specialization": "Cardiologist",
        "experience": 10,
        "consultationTiming": "9:00 AM-5:00 PM",
        "licenseNumber": "MD12345"
      }
    }
  ],
  "message": "Doctor List Fetched Successfully"
}
```

---

### **10. Book Appointment (Patient Only)**
**POST** `/appointment/booking`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <patient_token>
```

**Request Body:**
```json
{
  "healthIssues": "Chest pain and shortness of breath",
  "checkupTiming": "10:00-11:00",
  "doctor": "507f1f77bcf86cd799439011",
  "notes": "Patient experiencing chest pain for the past 2 days",
  "date": "2024-01-20"
}
```

**Expected Response (201):**
```json
{
  "status": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "healthIssues": "Chest pain and shortness of breath",
    "checkupTiming": "10:00-11:00",
    "doctor": "507f1f77bcf86cd799439011",
    "bookedBy": "507f1f77bcf86cd799439012",
    "notes": "Patient experiencing chest pain for the past 2 days",
    "status": "Pending",
    "date": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Appointment booked successfully"
}
```

---

### **11. Get All Appointments (Doctor Only)**
**GET** `/appointment/get-all-appointments?date=15-01-2024`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <doctor_token>
```

**Expected Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "healthIssues": "Chest pain and shortness of breath",
      "checkupTiming": "10:00-11:00",
      "doctor": "507f1f77bcf86cd799439011",
      "bookedBy": "507f1f77bcf86cd799439012",
      "notes": "Patient experiencing chest pain for the past 2 days",
      "status": "Pending",
      "date": "2024-01-20T00:00:00.000Z",
      "userDetails": {
        "_id": "507f1f77bcf86cd799439012",
        "email": "patient.jane@telemedicine.com",
        "fullName": "Jane Doe",
        "role": "PATIENT"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Appointment Details fetched successfully"
}
```

---

## 📋 **Postman Collection Variables**

### **Environment Variables:**
```
BASE_URL: http://localhost:3000/api
DOCTOR_TOKEN: <token_from_doctor_login>
PATIENT_TOKEN: <token_from_patient_login>
```

### **Pre-request Scripts:**

**For Doctor Login:**
```javascript
pm.sendRequest({
    url: pm.environment.get("BASE_URL") + "/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: "doctor.john@telemedicine.com",
            password: "password123"
        })
    }
}, function (err, response) {
    if (response.code === 200) {
        const data = response.json();
        pm.environment.set("DOCTOR_TOKEN", data.data.token);
    }
});
```

**For Patient Login:**
```javascript
pm.sendRequest({
    url: pm.environment.get("BASE_URL") + "/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: "patient.jane@telemedicine.com",
            password: "password123"
        })
    }
}, function (err, response) {
    if (response.code === 200) {
        const data = response.json();
        pm.environment.set("PATIENT_TOKEN", data.data.token);
    }
});
```

---

## 🚨 **Error Responses**

### **Invalid Credentials (400):**
```json
{
  "status": false,
  "message": "Invalid credentials"
}
```

### **Unauthorized Access (401):**
```json
{
  "status": false,
  "message": "Not authorized, no token"
}
```

### **Forbidden Access (403):**
```json
{
  "status": false,
  "message": "Access restricted to patients only"
}
```

### **Validation Error (400):**
```json
{
  "status": false,
  "message": "Password and confirm password do not match"
}
```

---

## 📝 **Testing Checklist**

### **Authentication Flow:**
- [ ] Register doctor
- [ ] Register patient
- [ ] Login doctor
- [ ] Login patient
- [ ] Get doctor specializations

### **Profile Management:**
- [ ] Update doctor profile
- [ ] Update patient profile
- [ ] Get profile (both roles)

### **Appointment System:**
- [ ] Get all doctors (public)
- [ ] Book appointment (patient only)
- [ ] Get appointments (doctor only)

### **Error Handling:**
- [ ] Invalid credentials
- [ ] Unauthorized access
- [ ] Forbidden access
- [ ] Validation errors 