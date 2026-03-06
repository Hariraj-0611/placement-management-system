# Bugfix Requirements Document

## Introduction

This document addresses a critical bug in the placement system where deleting a single student account causes all user login credentials (both students and staff) to be deleted from the system. This is a severe data integrity issue that affects the entire user base and prevents legitimate users from accessing the system after a student deletion operation.

The bug manifests during the hard delete operation in the `delete_user` function, where Django's CASCADE deletion behavior is incorrectly propagating beyond the intended scope, affecting unrelated user accounts across all roles (STUDENT, STAFF, PLACEMENT).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a placement officer deletes a student user through the `/api/users/<user_id>/delete/` endpoint THEN the system deletes all user login credentials for students, staff, and placement officers from the database

1.2 WHEN the `user.delete()` method is called on a student User object THEN the system cascades the deletion to unrelated User records beyond the intended student

1.3 WHEN a student with associated records (StudentProfile, Applications, PasswordResetTokens) is deleted THEN the system incorrectly triggers deletion of other users' authentication data

### Expected Behavior (Correct)

2.1 WHEN a placement officer deletes a student user through the `/api/users/<user_id>/delete/` endpoint THEN the system SHALL delete only that specific student's User record and their directly related records (StudentProfile, Applications, PasswordResetTokens)

2.2 WHEN the `user.delete()` method is called on a student User object THEN the system SHALL cascade deletion only to records that have a direct foreign key relationship to that specific user (StudentProfile, PasswordResetTokens, and Applications through StudentProfile)

2.3 WHEN a student with associated records is deleted THEN the system SHALL preserve all other users' authentication data and login credentials intact

2.4 WHEN a student who has applied to company drives is deleted THEN the system SHALL delete the student's Application records but preserve the CompanyDrive records and all other users' data

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a placement officer deletes a staff member THEN the system SHALL CONTINUE TO delete only that staff member's User and StaffProfile records without affecting other users

3.2 WHEN a student is deleted who has no applications THEN the system SHALL CONTINUE TO delete only the student's User and StudentProfile records

3.3 WHEN a placement officer views the user list after deleting a student THEN the system SHALL CONTINUE TO display all remaining active users correctly

3.4 WHEN users attempt to log in after a student deletion operation THEN the system SHALL CONTINUE TO authenticate all non-deleted users successfully

3.5 WHEN a placement officer is prevented from deleting their own account THEN the system SHALL CONTINUE TO return an error message without performing any deletion
