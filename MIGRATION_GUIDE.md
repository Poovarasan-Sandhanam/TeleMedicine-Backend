# TeleMedicine Backend Migration Guide

## Overview

This document outlines the changes made to implement best practices for separating doctors and patients in the TeleMedicine backend system.

## 🚀 **What Changed**

### 1. **New Role-Based System**
- **Before**: Used `isDoctor` boolean field
- **After**: Uses `role` enum with `DOCTOR`, `PATIENT`, `ADMIN` values

### 2. **Separate Profile Models**
- **Before**: Single `UserProfile` model for both doctors and patients
- **After**: Separate `DoctorProfile` and `PatientProfile` models

### 3. **Enhanced Authorization**
- **Before**: Scattered role checks in controllers
- **After**: Centralized role-based middleware

### 4. **Simplified Registration**
- **Before**: Complex registration with many fields
- **After**: Simple registration with only essential fields

## 📋 **API Changes**

### **Authentication Endpoints**

#### **Register User** (`POST /auth/register`)
**Simplified Registration - Only Essential Fields:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "John Doe",
  "role": "DOCTOR"           // "DOCTOR" or "PATIENT"
}
```

**Legacy format still supported:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "John Doe",
  "isDoctor": true           // Legacy field
}
```

#### **Login** (`POST /auth/login`)
**Response includes basic user info:**
```json
{
  "status": true,
  "data": {
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "DOCTOR",           // NEW
    "isDoctor": true,           // Legacy (for backward compatibility)
    "token": "jwt_token_here"
  },
  "message": "Login successful!"
}
```

#### **Get Doctor Specializations** (`GET /auth/doctor-specializations`)
**NEW ENDPOINT:**
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

### **Profile Endpoints**

#### **Update Profile** (`PUT /profile/update-profile`)
**Now handles different fields based on user role:**

**For Doctors:**
```json
{
  "name": "Dr. John Doe",
  "age": 35,
  "contactNumber": "+1234567890",
  "address": "123 Medical Center Dr",
  "specialization": "Cardiologist",
  "experience": 10,
  "consultationTiming": "9:00 AM-5:00 PM",
  "licenseNumber": "MD12345",
  "education": "Harvard Medical School",
  "certifications": "Board Certified Cardiologist",
  "languages": "English, Spanish"
}
```

**For Patients:**
```json
{
  "name": "Jane Smith",
  "age": 28,
  "bloodGroup": "O+",
  "weight": 65,
  "height": 165,
  "contactNumber": "+1234567890",
  "address": "456 Health Street",
  "ongoingTreatment": "None",
  "healthIssues": "Hypertension, Diabetes",
  "allergies": "Penicillin",
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "+1234567891"
  }
}
```

#### **Get Profile** (`GET /profile/get-profile`)
**Returns role-specific profile data with user information merged.**

### **Appointment Endpoints**

#### **Book Appointment** (`POST /appointment/booking`)
**Now requires patient role - enhanced validation:**
```json
{
  "healthIssues": "Chest pain",
  "checkupTiming": "10:00-11:00",
  "doctor": "doctor_user_id",
  "notes": "Patient experiencing chest pain",
  "date": "2024-01-15"
}
```

#### **Get All Appointments** (`GET /appointment/get-all-appointments`)
**Now requires doctor role - only doctors can view appointments.**

## 🔧 **Frontend Integration Guide**

### **1. Update Registration Forms**

**Simple Registration Form:**
```javascript
const registerUser = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      fullName: formData.fullName,
      role: formData.role  // "DOCTOR" or "PATIENT"
    })
  });
};
```

**Registration Form UI Example:**
```html
<form>
  <input type="text" name="fullName" placeholder="Full Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <input type="password" name="password" placeholder="Password" required />
  <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
  
  <select name="role" required>
    <option value="">Select Role</option>
    <option value="PATIENT">Patient</option>
    <option value="DOCTOR">Doctor</option>
  </select>
  
  <button type="submit">Register</button>
</form>
```

### **2. Update Login Handling**

```javascript
const handleLogin = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.status) {
    // Store both new and legacy fields for backward compatibility
    localStorage.setItem('user', JSON.stringify({
      ...data.data,
      // Ensure backward compatibility
      isDoctor: data.data.isDoctor || data.data.role === 'DOCTOR'
    }));
  }
};
```

### **3. Update Profile Forms**

**For Doctor Profile:**
```javascript
const updateDoctorProfile = async (profileData) => {
  const response = await fetch('/api/profile/update-profile', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: profileData.name,
      age: profileData.age,
      contactNumber: profileData.contactNumber,
      address: profileData.address,
      specialization: profileData.specialization,
      experience: profileData.experience,
      consultationTiming: profileData.consultationTiming,
      licenseNumber: profileData.licenseNumber,
      education: profileData.education,
      certifications: profileData.certifications,
      languages: profileData.languages
    })
  });
};
```

**For Patient Profile:**
```javascript
const updatePatientProfile = async (profileData) => {
  const response = await fetch('/api/profile/update-profile', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: profileData.name,
      age: profileData.age,
      bloodGroup: profileData.bloodGroup,
      weight: profileData.weight,
      height: profileData.height,
      contactNumber: profileData.contactNumber,
      address: profileData.address,
      ongoingTreatment: profileData.ongoingTreatment,
      healthIssues: profileData.healthIssues,
      allergies: profileData.allergies,
      emergencyContact: profileData.emergencyContact
    })
  });
};
```

### **4. Update Role-Based UI Logic**

```javascript
// Check user role for UI rendering
const user = JSON.parse(localStorage.getItem('user'));
const isDoctor = user.role === 'DOCTOR' || user.isDoctor === true;
const isPatient = user.role === 'PATIENT' || user.isDoctor === false;

// Show/hide elements based on role
if (isDoctor) {
  // Show doctor-specific UI
  showDoctorDashboard();
} else if (isPatient) {
  // Show patient-specific UI
  showPatientDashboard();
}
```

### **5. Update Appointment Booking**

```javascript
const bookAppointment = async (appointmentData) => {
  // This endpoint now requires patient role
  const response = await fetch('/api/appointment/booking', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(appointmentData)
  });
  
  if (response.status === 403) {
    // Handle unauthorized access (non-patient trying to book)
    showError('Only patients can book appointments');
  }
};
```

## 🔄 **Migration Steps**

### **1. Run Database Migration**
```bash
# Run the migration script
npm run migrate
# or
node src/utilities/migration.ts
```

### **2. Update Frontend Code**
1. **Simplify registration forms** - only basic fields
2. **Update login handling** to store both new and legacy fields
3. **Update profile forms** for role-specific fields
4. **Update role-based UI logic**
5. **Test all functionality**

### **3. Gradual Migration**
- Legacy fields (`isDoctor`) are still supported
- New fields (`role`) are preferred
- Both systems work simultaneously during transition

## 🚨 **Breaking Changes**

### **Registration Simplification**
- **Before**: Complex registration with many fields
- **After**: Simple registration with only essential fields

### **Authorization Changes**
- **Before**: Any authenticated user could access appointment endpoints
- **After**: Role-based access control enforced

### **Profile Field Changes**
- **Before**: Mixed fields in single profile
- **After**: Role-specific fields in separate models

## ✅ **Testing Checklist**

- [ ] **Simple registration** (email, password, confirmPassword, fullName, role)
- [ ] **Password confirmation validation**
- [ ] **User login and token generation**
- [ ] **Profile updates** (role-specific fields)
- [ ] **Appointment booking** (patient-only)
- [ ] **Appointment viewing** (doctor-only)
- [ ] **Role-based UI rendering**
- [ ] **Backward compatibility** with legacy fields

## 🎯 **UX Improvements**

### **Registration Flow:**
1. **Simple Form**: Only essential fields
2. **Role Selection**: Clear doctor/patient choice
3. **Password Confirmation**: Built-in validation
4. **Quick Setup**: Users can complete registration quickly
5. **Profile Completion**: Detailed info collected later

### **Profile Management:**
1. **Role-Specific Forms**: Different fields for doctors vs patients
2. **Progressive Disclosure**: Show relevant fields based on role
3. **Better Validation**: Role-specific field requirements
4. **Enhanced UX**: Cleaner, more focused forms

## 📞 **Support**

If you encounter any issues during migration:
1. Check the server logs for detailed error messages
2. Verify that all required fields are being sent
3. Ensure proper authorization headers are included
4. Test with both new and legacy field formats

## 🔮 **Future Enhancements**

- Remove legacy fields after full migration
- Add more granular permissions
- Implement role-based API rate limiting
- Add audit logging for role changes
- Add email verification for new registrations 