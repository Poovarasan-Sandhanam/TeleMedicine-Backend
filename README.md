# TeleMedicine Backend

A production-style REST API for a telemedicine platform that connects patients with doctors, manages appointment scheduling and payments, and supports e-prescriptions and AI-powered symptom triage.

Built with **Node.js, TypeScript, Express and MongoDB**, and deployed on **Google Cloud Run**.

**Live API:**  
https://telemedicine-api-415505316945.europe-west2.run.app/health

---

## Overview

The platform provides two primary user roles:

- **Patients** — describe symptoms, find doctors, view availability, book consultations, make payments and access prescriptions.
- **Doctors** — manage profiles, consultation schedules and prescriptions.

The backend focuses on real-world concerns such as:

- Secure authentication and authorization
- Appointment concurrency and temporary slot holds
- Stripe payment verification
- Distributed token revocation
- Database-backed rate limiting
- AI safety and emergency screening
- Cloud deployment and health checks
- Graceful handling of optional services

---

## Features

### Authentication & Roles

- JWT-based authentication
- 48-hour access tokens
- Patient and doctor roles
- Separate patient and doctor profiles
- Role-based authorization
- Server-side token revocation
- Revoked tokens stored as hashes in MongoDB
- Token revocation works across multiple Cloud Run instances

### Doctor Discovery

Patients can:

- Browse doctors by type
- Filter by specialization
- View completed doctor profiles
- View available consultation slots

Available slots are generated from:

```text
Doctor consultation hours
        -
Existing bookings / holds
        =
Available slots
