
```
Sahayog
├─ client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ ConfirmDialog.tsx
│  │  │  ├─ FormElements.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ NotificationBell.tsx
│  │  │  └─ ProtectedRoute.tsx
│  │  ├─ context
│  │  │  └─ AuthContext.tsx
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  └─ api.ts
│  │  ├─ main.tsx
│  │  └─ pages
│  │     ├─ Admin
│  │     │  ├─ Account.tsx
│  │     │  ├─ Camps.tsx
│  │     │  ├─ Donors.tsx
│  │     │  ├─ Hospitals.tsx
│  │     │  ├─ index.tsx
│  │     │  ├─ Notifications.tsx
│  │     │  ├─ Overview.tsx
│  │     │  └─ Requests.tsx
│  │     ├─ BloodBankStatus.tsx
│  │     ├─ Camps.tsx
│  │     ├─ Dashboard.tsx
│  │     ├─ ForgotPassword.tsx
│  │     ├─ Home.tsx
│  │     ├─ Login.tsx
│  │     ├─ Register.tsx
│  │     ├─ RequestBlood.tsx
│  │     ├─ RequestDetail.tsx
│  │     └─ VerifyOtp.tsx
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ LICENSE
├─ package-lock.json
├─ package.json
├─ README.md
└─ server
   ├─ package-lock.json
   ├─ package.json
   ├─ src
   │  ├─ app.ts
   │  ├─ config
   │  │  ├─ database.ts
   │  │  └─ firebase.ts
   │  ├─ controllers
   │  │  ├─ adminController.ts
   │  │  ├─ authController.ts
   │  │  ├─ bloodBankStatusController.ts
   │  │  ├─ bloodRequestController.ts
   │  │  ├─ campRSVPController.ts
   │  │  ├─ cityController.ts
   │  │  ├─ deviceTokenController.ts
   │  │  ├─ donationCampController.ts
   │  │  ├─ donationHistoryController.ts
   │  │  ├─ donorMatchingController.ts
   │  │  ├─ donorProfileController.ts
   │  │  ├─ hospitalController.ts
   │  │  ├─ notificationController.ts
   │  │  ├─ passwordController.ts
   │  │  └─ requestResponseController.ts
   │  ├─ middleware
   │  │  ├─ adminMiddleware.ts
   │  │  ├─ authMiddleware.ts
   │  │  ├─ errorHandler.ts
   │  │  ├─ rateLimiterMiddleware.ts
   │  │  └─ validationMiddleware.ts
   │  ├─ models
   │  │  ├─ BloodBankStatus.ts
   │  │  ├─ BloodRequest.ts
   │  │  ├─ CampRSVP.ts
   │  │  ├─ City.ts
   │  │  ├─ DeviceToken.ts
   │  │  ├─ DonationCamp.ts
   │  │  ├─ DonationHistory.ts
   │  │  ├─ DonorProfile.ts
   │  │  ├─ HealthLog.ts
   │  │  ├─ Hospital.ts
   │  │  ├─ index.ts
   │  │  ├─ Notification.ts
   │  │  ├─ OtpVerification.ts
   │  │  ├─ RefreshToken.ts
   │  │  ├─ RequestResponse.ts
   │  │  └─ User.ts
   │  ├─ routes
   │  │  ├─ adminRoutes.ts
   │  │  ├─ authRoutes.ts
   │  │  ├─ bloodBankStatusRoutes.ts
   │  │  ├─ bloodRequestRoutes.ts
   │  │  ├─ campRSVPRoutes.ts
   │  │  ├─ cityRoutes.ts
   │  │  ├─ deviceTokenRoutes.ts
   │  │  ├─ donationCampRoutes.ts
   │  │  ├─ donationHistoryRoutes.ts
   │  │  ├─ donorMatchingRoutes.ts
   │  │  ├─ donorProfileRoutes.ts
   │  │  ├─ hospitalRoutes.ts
   │  │  ├─ notificationRoutes.ts
   │  │  └─ requestResponseRoutes.ts
   │  ├─ schemas
   │  │  ├─ adminSchemas.ts
   │  │  ├─ authSchemas.ts
   │  │  ├─ bloodBankStatusSchemas.ts
   │  │  ├─ bloodRequestSchemas.ts
   │  │  ├─ deviceTokenSchemas.ts
   │  │  ├─ donationCampSchemas.ts
   │  │  ├─ donationHistorySchemas.ts
   │  │  ├─ donorMatchingSchemas.ts
   │  │  ├─ donorProfileSchemas.ts
   │  │  ├─ hospitalSchemas.ts
   │  │  ├─ notificationSchemas.ts
   │  │  └─ requestResponseSchemas.ts
   │  ├─ server.ts
   │  ├─ services
   │  │  ├─ adminService.ts
   │  │  ├─ authService.ts
   │  │  ├─ bloodBankStatusService.ts
   │  │  ├─ bloodRequestService.ts
   │  │  ├─ cityService.ts
   │  │  ├─ deviceTokenService.ts
   │  │  ├─ donationCampService.ts
   │  │  ├─ donationHistoryService.ts
   │  │  ├─ donorMatchingService.ts
   │  │  ├─ donorProfileService.ts
   │  │  ├─ fcmService.ts
   │  │  ├─ notificationDeliveryService.ts
   │  │  ├─ notificationService.ts
   │  │  ├─ otpService.ts
   │  │  ├─ passwordService.ts
   │  │  ├─ requestBroadcastService.ts
   │  │  ├─ requestExpiryService.ts
   │  │  ├─ requestResponseService.ts
   │  │  └─ seedAdmin.ts
   │  ├─ types
   │  │  ├─ authtypes.ts
   │  │  ├─ enums.ts
   │  │  └─ express.d.ts
   │  └─ utils
   │     ├─ apiError.ts
   │     ├─ asyncHandler.ts
   │     ├─ bloodCompatibility.ts
   │     ├─ distance.ts
   │     ├─ donorEligibility.ts
   │     ├─ jwtUtil.ts
   │     ├─ matchingScore.ts
   │     ├─ otpUtil.ts
   │     └─ passwordUtil.ts
   └─ tsconfig.json

```